import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import type { ReactNode } from "react";

import { AuditReportEmail } from "@/components/emails/audit-report-email";
import { getPublicAuditById } from "@/lib/audit-public";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendReportEmailInput {
  to: string;
  subject: string;
  email: ReactNode;
}

async function sendWithSmtp({ to, subject, email }: SendReportEmailInput) {
  const smtpEmail = process.env.SMTP_EMAIL?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();

  if (!smtpEmail || !smtpPassword) {
    throw new Error("SMTP email provider is not configured.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });

  const html = await render(email);
  const data = await transporter.sendMail({
    from: smtpEmail,
    to,
    subject,
    html,
  });

  return { provider: "gmail-smtp", data };
}

async function sendWithResend({ to, subject, email }: SendReportEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!resendApiKey || !resendFromEmail) {
    throw new Error("Resend email provider is not fully configured.");
  }

  if (resendFromEmail.includes("@resend.dev")) {
    throw new Error("Resend sender must use a verified production domain.");
  }

  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.send({
    from: resendFromEmail,
    to,
    subject,
    react: email,
  });

  if (error) {
    throw new Error(error.message || "Failed to send report email with Resend.");
  }

  return { provider: "resend", data };
}

// Supabase client with service role to bypass RLS for lead saving if needed
// (Though we added a public insert policy, service role is safer for background processes)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendReportEmail({ to, subject, email }: SendReportEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (resendApiKey && resendFromEmail) {
    try {
      return await sendWithResend({ to, subject, email });
    } catch (error) {
      console.warn(
        "[LEADS API] Resend delivery failed; falling back to Gmail SMTP:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return sendWithSmtp({ to, subject, email });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, company, role, teamSize, auditId } = body;
    const recipientEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!recipientEmail || !auditId) {
      return NextResponse.json(
        { error: "Email and Audit ID are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 1. Save lead data to Supabase
    const { error: dbError } = await supabaseAdmin.from("leads").insert({
      email: recipientEmail,
      company,
      role,
      team_size: teamSize,
      audit_id: auditId,
    });

    if (dbError) {
      console.error("[LEADS API] Database error:", dbError);
      // We continue even if DB save fails, to ensure user gets their email
    }

    // 2. Fetch audit data for the email
    const audit = await getPublicAuditById(auditId);
    if (!audit || !audit.result) {
      return NextResponse.json(
        { error: "Audit results not found." },
        { status: 404 }
      );
    }

    // 3. Send transactional email via the configured provider
    const reportUrl = `${new URL(request.url).origin}/r/${auditId}`;
    const subject = `Your AI Spend Optimization Report - ${company || "Aethra"}`;
    const emailTemplate = AuditReportEmail({
      auditId,
      result: audit.result,
      company,
      reportUrl,
    });

    const data = await sendReportEmail({
      to: recipientEmail,
      subject,
      email: emailTemplate,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
