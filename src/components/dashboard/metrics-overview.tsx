import type { AuditEngineResult } from "@/lib/audit-engine";

interface MetricsOverviewProps {
  result: AuditEngineResult;
}

export function MetricsOverview({ result }: MetricsOverviewProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Monthly spend" value={`$${result.totalMonthlySpendUsd.toFixed(2)}`} />
      <MetricCard label="Annual spend" value={`$${result.totalAnnualSpendUsd.toFixed(2)}`} />
      <MetricCard label="Est. monthly savings" value={`$${result.estimatedMonthlySavingsUsd.toFixed(2)}`} />
      <MetricCard label="Est. annual savings" value={`$${result.estimatedAnnualSavingsUsd.toFixed(2)}`} />
    </section>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background/45 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
