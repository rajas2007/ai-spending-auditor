import type { Metadata } from "next";

import { ReportRoute } from "@/components/report/report-route";
import { getPublicAuditById } from "@/lib/audit-public";
import type { StoredAudit } from "@/types/stored-audit";

export const dynamic = "force-dynamic";

function buildReportMetadata(audit: StoredAudit | null, reportId: string): Metadata {
  const title = audit
    ? `Aethra report · $${audit.result.estimatedMonthlySavingsUsd.toFixed(0)} monthly savings`
    : `Aethra report ${reportId}`;

  const description = audit
    ? `A public AI spend audit with ${audit.result.recommendations.length} actionable recommendations and estimated savings of $${audit.result.estimatedMonthlySavingsUsd.toFixed(2)} per month.`
    : "Aethra AI spend optimization report. View savings, tool breakdowns, and prioritized recommendations from your shared audit.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Aethra",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const audit = await getPublicAuditById(id);
    return buildReportMetadata(audit, id);
  } catch {
    return buildReportMetadata(null, id);
  }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log("[REPORT PAGE] params.id:", id);
  
  let audit: StoredAudit | null = null;
  let error: string | null = null;

  try {
    console.log("[REPORT PAGE] Calling getPublicAuditById with id:", id);
    audit = await getPublicAuditById(id);
    console.log("[REPORT PAGE] getPublicAuditById returned:", audit ? { id: audit.id, userId: audit.userId, hasResult: Boolean(audit.result) } : null);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load this report.";
    console.error("[REPORT PAGE] Error fetching audit:", error);
  }

  let safeAudit = audit;
  if (audit) {
    // Strip undefined values to prevent Next.js serialization issues across Server/Client boundary
    safeAudit = JSON.parse(JSON.stringify(audit));
  }

  console.log("[REPORT PAGE] Rendering ReportRoute with:", { reportId: id, auditNull: safeAudit === null, hasError: error !== null });
  return <ReportRoute reportId={id} initialAudit={safeAudit} initialError={error} />;
}
