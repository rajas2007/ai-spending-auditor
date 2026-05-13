import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

import { AuditReportEmail } from "@/components/emails/audit-report-email";
import { getPublicAuditById } from "@/lib/audit-public";

// Supabase client with service role to bypass RLS for lead saving if needed
// (Though we added a public insert policy, service role is safer for background processes)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const { email, company, role, teamSize, auditId } = body;


    if (!email || !auditId) {
      return NextResponse.json(
        { error: "Email and Audit ID are required." },
        { status: 400 }
      );
    }

    // 1. Save lead data to Supabase
    const { error: dbError } = await supabaseAdmin.from("leads").insert({
      email,
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

    // 3. Send transactional email via Resend
    const reportUrl = `${new URL(request.url).origin}/r/${auditId}`;

    const { data, error: mailError } = await resend.emails.send({
      from: "onboarding@resend.dev", // In production, this should be a verified domain
      to: email,
      subject: `Your AI Spend Optimization Report - ${company || "Aethra"}`,
      react: AuditReportEmail({
        auditId,
        result: audit.result,
        company,
        reportUrl,
      }),
    });

    if (mailError) {
      if (mailError.name === "missing_api_key") {
        return NextResponse.json({
          success: true,
          warning: "Lead saved but email not sent (RESEND_API_KEY missing)."
        });
      }
      throw new Error("Failed to send report email.");
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
