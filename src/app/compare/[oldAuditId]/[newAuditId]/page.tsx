import { AuditResults } from "@/components/audit/audit-results";
import { getPublicAuditById } from "@/lib/audit-public";
import type { StoredAudit } from "@/types/stored-audit";

export const dynamic = "force-dynamic";

async function fetchAudit(id: string): Promise<StoredAudit | null> {
  try {
    return await getPublicAuditById(id);
  } catch {
    return null;
  }
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ oldAuditId: string; newAuditId: string }>;
}) {
  const { oldAuditId, newAuditId } = await params;
  const [oldAudit, newAudit] = await Promise.all([
    fetchAudit(oldAuditId),
    fetchAudit(newAuditId),
  ]);

  // Simple fallback if either audit missing
  if (!oldAudit || !newAudit) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Unable to load one or both audits for comparison.
      </div>
    );
  }

  const diffLines = [] as string[];
  if (oldAudit.pricingVersionUsed !== newAudit.pricingVersionUsed) {
    diffLines.push(
      `Pricing version changed: ${oldAudit.pricingVersionUsed ?? "-"} → ${newAudit.pricingVersionUsed ?? "-"}`
    );
  }
  if (
    oldAudit.result.estimatedMonthlySavingsUsd !==
    newAudit.result.estimatedMonthlySavingsUsd
  ) {
    diffLines.push(
      `Estimated monthly savings changed: $${oldAudit.result.estimatedMonthlySavingsUsd.toFixed(
        2
      )} → $${newAudit.result.estimatedMonthlySavingsUsd.toFixed(2)}`
    );
  }
  if (oldAudit.result.recommendations.length !== newAudit.result.recommendations.length) {
    diffLines.push(
      `Number of recommendations changed: ${oldAudit.result.recommendations.length} → ${newAudit.result.recommendations.length}`
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-center">
        Audit Comparison
      </h1>
      {/* Diff summary */}
      {diffLines.length > 0 && (
        <div className="mb-8 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4">
          <h2 className="mb-2 text-lg font-medium text-amber-800">Changes</h2>
          <ul className="list-disc space-y-1 pl-5 text-amber-700">
            {diffLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Side‑by‑side audits */}
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-medium">Original Audit</h2>
          <AuditResults result={oldAudit.result} />
        </section>
        <section>
          <h2 className="mb-4 text-xl font-medium">Re‑audit</h2>
          <AuditResults result={newAudit.result} />
        </section>
      </div>
    </div>
  );
}
