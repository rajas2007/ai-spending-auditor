import type { AuditEngineResult } from "@/lib/audit-engine";

import { MetricsOverview } from "@/components/dashboard/metrics-overview";

interface AuditResultsProps {
  result: AuditEngineResult | null;
}

export function AuditResults({ result }: AuditResultsProps) {
  if (!result) {
    return (
      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Audit Results</h2>
        <p className="mt-2 text-sm text-zinc-500">Submit the form to generate your spending audit.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Audit Results</h2>

      <MetricsOverview result={result} />

      <div className="space-y-2">
        <h3 className="text-base font-medium">Recommendations</h3>
        {result.recommendations.map((recommendation) => (
          <article key={recommendation.id} className="rounded-md border p-3">
            <p className="font-medium text-zinc-900">{recommendation.title}</p>
            <p className="mt-1 text-sm text-zinc-600">{recommendation.currentSituation}</p>
            <p className="text-sm text-zinc-600">{recommendation.suggestedAction}</p>
            <p className="mt-2 text-sm text-zinc-700">
              Estimated monthly savings: ${recommendation.estimatedMonthlySavingsUsd.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">{recommendation.financialReasoning}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
