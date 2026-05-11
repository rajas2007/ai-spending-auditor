"use client";

import type { AuditEngineResult } from "@/lib/audit-engine";
import { AlertTriangle, ArrowDownRight, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StableChartFrame } from "@/components/charts/stable-chart-frame";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { TOOL_LABELS } from "@/data/tool-options";

interface AuditResultsProps {
  result: AuditEngineResult | null;
}

export function AuditResults({ result }: AuditResultsProps) {
  if (!result) {
    return (
      <section className="min-w-0 rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="text-lg font-semibold">Audit results</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit the form to generate your AI spend analysis in Aethra.
        </p>
      </section>
    );
  }

  const trend = createTrendData(result);
  const breakdown = result.toolBreakdown.map((tool, index) => ({
    name: TOOL_LABELS[tool.toolId],
    value: tool.computedMonthlyCostUsd,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <section className="min-w-0 space-y-5 rounded-2xl border border-border bg-card/60 p-5 shadow-elevated sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-primary">Results</p>
          <h2 className="mt-1 break-words text-xl font-semibold">Your AI spend optimization report</h2>
        </div>
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <TrendingDown className="h-3.5 w-3.5" />
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            ${result.estimatedMonthlySavingsUsd.toFixed(2)} potential monthly savings
          </span>
        </span>
      </div>

      <MetricsOverview result={result} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-border bg-background/45 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Spend trajectory</p>
          <p className="mb-4 break-words text-sm text-foreground">Current vs optimized monthly spend</p>
          <StableChartFrame>
              <AreaChart data={trend} margin={{ left: -12, right: 6, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="currentSpend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.66 0.22 295)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="oklch(0.66 0.22 295)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="optimizedSpend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.16 162)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.72 0.16 162)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.72 0.012 285)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="oklch(0.72 0.012 285)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Math.round(value)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.009 285)",
                    border: "1px solid oklch(0.27 0.01 285)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="current" stroke="oklch(0.66 0.22 295)" strokeWidth={2} fill="url(#currentSpend)" />
                <Area type="monotone" dataKey="optimized" stroke="oklch(0.72 0.16 162)" strokeWidth={2} fill="url(#optimizedSpend)" />
              </AreaChart>
          </StableChartFrame>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-background/45 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Tool breakdown</p>
          <p className="mb-4 break-words text-sm text-foreground">Monthly spend by product</p>
          <StableChartFrame>
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="oklch(0.145 0.012 285)"
                >
                  {breakdown.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}
                  contentStyle={{
                    background: "oklch(0.18 0.009 285)",
                    border: "1px solid oklch(0.27 0.01 285)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </PieChart>
          </StableChartFrame>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium">Recommendations</h3>
        {result.recommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className="min-w-0 rounded-xl border border-border bg-background/45 p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="break-words font-medium text-foreground">{recommendation.title}</p>
                <p className="mt-1 break-words text-sm text-muted-foreground">{recommendation.currentSituation}</p>
              </div>
              <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                {recommendation.priority}
              </span>
            </div>
            <p className="mt-2 break-words text-sm text-muted-foreground">{recommendation.suggestedAction}</p>
            <p className="mt-2 break-words text-sm text-foreground [overflow-wrap:anywhere]">
              Estimated monthly savings: ${recommendation.estimatedMonthlySavingsUsd.toFixed(2)}
            </p>
            <p className="mt-1 break-words text-xs text-muted-foreground">{recommendation.financialReasoning}</p>
          </article>
        ))}
        {result.recommendations.length === 0 ? (
          <div className="rounded-xl border border-border bg-background/45 p-6 text-center text-sm text-muted-foreground">
            <ArrowDownRight className="mx-auto mb-2 h-5 w-5 text-emerald-300" />
            No immediate opportunities found. Your stack already looks efficient.
          </div>
        ) : null}
      </div>
    </section>
  );
}

const CHART_COLORS = [
  "oklch(0.66 0.22 295)",
  "oklch(0.72 0.16 162)",
  "oklch(0.7 0.14 232)",
  "oklch(0.65 0.22 12)",
  "oklch(0.78 0.14 80)",
];

function createTrendData(result: AuditEngineResult) {
  const monthly = result.totalMonthlySpendUsd;
  const optimized = Math.max(0, monthly - result.estimatedMonthlySavingsUsd);
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return monthLabels.map((month, index) => {
    const growth = 1 + index * 0.04;
    return {
      month,
      current: Number((monthly * growth).toFixed(2)),
      optimized: Number((optimized * growth).toFixed(2)),
    };
  });
}
