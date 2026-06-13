import type { Metadata } from "next";

import { ReportRoute } from "@/components/report/report-route";
import { getPublicAuditById, getLatestReauditForAudit } from "@/lib/audit-public";
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
  
  let audit: StoredAudit | null = null;
  let reaudit: StoredAudit | null = null;
  let error: string | null = null;

  try {
    audit = await getPublicAuditById(id);
    if (audit) {
      reaudit = await getLatestReauditForAudit(id);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load this report.";
  }

  let safeAudit = audit;
  if (audit) {
    // Strip undefined values to prevent Next.js serialization issues across Server/Client boundary
    safeAudit = JSON.parse(JSON.stringify(audit));
  }

  let safeReaudit = reaudit;
  if (reaudit) {
    // Strip undefined values to prevent Next.js serialization issues across Server/Client boundary
    safeReaudit = JSON.parse(JSON.stringify(reaudit));
  }

  return <ReportRoute reportId={id} initialAudit={safeAudit} initialError={error} relatedReaudit={safeReaudit} />;
}
