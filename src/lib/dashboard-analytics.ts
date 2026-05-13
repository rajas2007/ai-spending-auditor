import type { StoredAudit } from "@/types/stored-audit";

export interface DashboardAnalytics {
  latestAudit: StoredAudit | null;
  monthlySpendUsd: number;
  annualSpendUsd: number;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
  optimizationScore: number;
  recommendationCount: number;
  toolBreakdown: Array<{ name: string; spend: number }>;
  spendTrend: Array<{ label: string; spend: number; optimized: number }>;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function monthLabel(isoDate: string) {
  return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(isoDate));
}

export function buildDashboardAnalytics(audits: StoredAudit[]): DashboardAnalytics {
  const sorted = [...audits].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const latestAudit = sorted[0] ?? null;
  const latest = latestAudit?.result;
  const monthlySpendUsd = latest?.totalMonthlySpendUsd ?? 0;
  const monthlySavingsUsd = latest?.estimatedMonthlySavingsUsd ?? 0;
  const savingsRate = monthlySpendUsd > 0 ? monthlySavingsUsd / monthlySpendUsd : 0;

  const trendSource = sorted.slice(0, 6).reverse();

  return {
    latestAudit,
    monthlySpendUsd,
    annualSpendUsd: roundCurrency(monthlySpendUsd * 12),
    monthlySavingsUsd,
    annualSavingsUsd: roundCurrency(monthlySavingsUsd * 12),
    optimizationScore: latest?.optimizationScore ?? Math.max(42, Math.min(98, Math.round(72 + savingsRate * 100))),
    recommendationCount: latest?.recommendations.length ?? 0,
    toolBreakdown:
      latest?.toolBreakdown.map((tool) => ({
        name: tool.toolId,
        spend: tool.computedMonthlyCostUsd,
      })) ?? [],
    spendTrend: trendSource.map((audit) => ({
      label: monthLabel(audit.createdAt),
      spend: audit.result.totalMonthlySpendUsd,
      optimized: roundCurrency(audit.result.totalMonthlySpendUsd - audit.result.estimatedMonthlySavingsUsd),
    })),
  };
}
