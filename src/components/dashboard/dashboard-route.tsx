"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Activity, ArrowRight, CircleDollarSign, History, LineChart, Lock, Sparkles, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { useAuth } from "@/components/auth/auth-provider";
import { AuditResults } from "@/components/audit/audit-results";
import { StableChartFrame } from "@/components/charts/stable-chart-frame";
import { ProductShell } from "@/components/layout/product-shell";
import { Button } from "@/components/ui/button";
import { listAuditsForUser, splitAuditsByTier } from "@/lib/audit-storage";
import { buildDashboardAnalytics } from "@/lib/dashboard-analytics";
import type { StoredAudit } from "@/types/stored-audit";
import { FREE_AUDIT_HISTORY_LIMIT } from "@/types/subscription";

export function DashboardRoute() {
  const { user, profile } = useAuth();
  const userId = user?.id;
  const [dashboardState, setDashboardState] = useState<{
    userId: string | null;
    audits: StoredAudit[];
    error: string | null;
    isLoading: boolean;
  }>({
    userId: null,
    audits: [],
    error: null,
    isLoading: false,
  });
  const audits = useMemo(
    () => (dashboardState.userId === userId ? dashboardState.audits : []),
    [dashboardState.audits, dashboardState.userId, userId],
  );
  const error = dashboardState.userId === userId ? dashboardState.error : null;
  const isLoading = Boolean(userId) && (dashboardState.userId !== userId || dashboardState.isLoading);
  const tier = profile?.subscriptionTier ?? "free";
  const { visibleAudits, lockedAudits } = useMemo(() => splitAuditsByTier(audits, tier), [audits, tier]);
  const analytics = useMemo(() => buildDashboardAnalytics(visibleAudits), [visibleAudits]);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      return () => {
        cancelled = true;
      };
    }

    listAuditsForUser(userId)
      .then((records) => {
        if (!cancelled) {
          setDashboardState({
            userId,
            audits: records,
            error: null,
            isLoading: false,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDashboardState({
            userId,
            audits: [],
            error: err instanceof Error ? err.message : "Unable to load dashboard data.",
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <ProductShell>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Analytics dashboard
          </div>
          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">AI spend intelligence center.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Dashboard metrics now come from your saved Aethra audits: spend, recommendations, savings estimates, tool mix, and report history.
          </p>
        </div>
        <Button variant="hero" size="xl" asChild>
          <a href="/audit">
            Run new audit
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="glass mb-6 rounded-2xl p-6 text-sm text-muted-foreground">Loading workspace analytics...</div>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <InsightCard icon={CircleDollarSign} label="Monthly spend" value={`$${analytics.monthlySpendUsd.toFixed(2)}`} />
        <InsightCard icon={LineChart} label="Annualized savings" value={`$${analytics.annualSavingsUsd.toFixed(2)}`} />
        <InsightCard icon={Zap} label="Optimization score" value={analytics.latestAudit ? String(analytics.optimizationScore) : "--"} />
        <InsightCard icon={Activity} label="Recommendations" value={String(analytics.recommendationCount)} />
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="min-w-0 rounded-2xl border border-border bg-card/40 p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">Spend trend</p>
              <p className="break-words text-xs text-muted-foreground">Current vs optimized run-rate from saved audits</p>
            </div>
            <span className="ml-3 shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              {tier === "pro" ? "Pro analytics" : "Free analytics"}
            </span>
          </div>
          <div className="min-w-0">
            {analytics.spendTrend.length > 0 ? (
              <StableChartFrame className="h-72 min-h-[18rem]">
                <BarChart data={analytics.spendTrend}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="oklch(0.72 0.012 285)" fontSize={12} />
                  <YAxis stroke="oklch(0.72 0.012 285)" fontSize={12} />
                  <Tooltip
                    cursor={{ fill: "oklch(0.66 0.22 295 / 0.08)" }}
                    contentStyle={{
                      background: "oklch(0.18 0.009 285)",
                      border: "1px solid oklch(1 0 0 / 0.08)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="spend" fill="oklch(0.66 0.22 295)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="optimized" fill="oklch(0.72 0.16 162)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </StableChartFrame>
            ) : (
              <EmptyState />
            )}
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-border bg-card/40 p-5 shadow-card">
          <p className="text-sm font-medium">Tool breakdown</p>
          <p className="mt-1 text-xs text-muted-foreground">Latest audit monthly spend by tool</p>
          <div className="mt-5 space-y-3">
            {analytics.toolBreakdown.length > 0 ? (
              analytics.toolBreakdown.map((tool) => (
                <div key={tool.name}>
                  <div className="mb-1 flex min-w-0 justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate">{tool.name}</span>
                    <span className="shrink-0 text-muted-foreground">${tool.spend.toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary to-emerald-300"
                      style={{ width: `${Math.min(100, (tool.spend / Math.max(1, analytics.monthlySpendUsd)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState compact />
            )}
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <ProPlaceholder title="Advanced analytics" body="Cohort benchmarks, variance alerts, and renewal risk scoring are ready for Pro plan data." />
        <ProPlaceholder title="Premium insights" body="Pro workspaces will unlock deeper optimization narratives and finance review exports." />
        <ProPlaceholder title="Billing connectors" body="Stripe, Ramp, QuickBooks, and warehouse connectors can attach to the same audit history model." />
      </section>

      <section className="mb-6 min-w-0 rounded-2xl border border-border bg-card/40 p-5 shadow-card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4 text-primary" />
              Audit history
            </p>
            <p className="mt-1 break-words text-xs text-muted-foreground">
              Free workspaces show the latest {FREE_AUDIT_HISTORY_LIMIT} audits. Upgrade messaging appears when older audits exist.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/audit">New audit</a>
          </Button>
        </div>
        <div className="grid gap-3">
          {visibleAudits.map((audit) => (
            <a
              key={audit.id}
              href={`/r/${audit.id}`}
              className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-background/35 p-4 transition-colors hover:border-primary/40 hover:bg-card/60 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="min-w-0">
                <span className="block break-words text-sm font-medium [overflow-wrap:anywhere]">${audit.result.totalMonthlySpendUsd.toFixed(2)} monthly AI spend</span>
                <span className="break-words text-xs text-muted-foreground">
                  {new Date(audit.createdAt).toLocaleString()} · {audit.result.recommendations.length} recommendations
                </span>
              </span>
              <span className="break-words text-sm text-primary [overflow-wrap:anywhere] sm:max-w-[40%] sm:text-right">
                ${audit.result.estimatedMonthlySavingsUsd.toFixed(2)} possible monthly savings
              </span>
            </a>
          ))}
          {visibleAudits.length === 0 ? <EmptyState /> : null}
          {lockedAudits.length > 0 ? (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{lockedAudits.length} older audit(s) are locked on Free.</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Upgrade to Pro will unlock unlimited history, advanced analytics, and premium insights when payments are connected.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <AuditResults result={analytics.latestAudit?.result ?? null} />
    </ProductShell>
  );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid place-items-center rounded-xl border border-dashed border-border bg-background/30 text-center text-sm text-muted-foreground ${compact ? "min-h-28 p-4" : "min-h-48 p-6"}`}>
      Run an audit to populate this workspace.
    </div>
  );
}

function ProPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <article className="min-w-0 rounded-2xl border border-border bg-card/35 p-5 shadow-card">
      <p className="break-words text-sm font-medium">{title}</p>
      <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{body}</p>
      <Button variant="glow" size="sm" className="mt-4">
        Upgrade to Pro
      </Button>
    </article>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card/50 p-5 shadow-card">
      <Icon className="mb-4 h-5 w-5 text-primary" />
      <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-3xl font-semibold tracking-tight [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}
