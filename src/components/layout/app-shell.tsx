"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Activity, ArrowRight, BarChart3, CircleDollarSign, LockKeyhole, ShieldCheck, Sparkles, TrendingDown, Zap, type LucideIcon } from "lucide-react";

const ConsultationCta = dynamic(() => import("@/components/landing/consultation-cta").then(mod => mod.ConsultationCta));
const Faq = dynamic(() => import("@/components/landing/faq").then(mod => mod.Faq));
const Features = dynamic(() => import("@/components/landing/features").then(mod => mod.Features));
const Footer = dynamic(() => import("@/components/landing/footer").then(mod => mod.Footer));
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then(mod => mod.HowItWorks));
const LogoCloud = dynamic(() => import("@/components/landing/logo-cloud").then(mod => mod.LogoCloud));
const Pricing = dynamic(() => import("@/components/landing/pricing").then(mod => mod.Pricing));
const Stats = dynamic(() => import("@/components/landing/stats").then(mod => mod.Stats));

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { buildDashboardAnalytics } from "@/lib/dashboard-analytics";
import { listAuditsForUser } from "@/lib/audit-storage";
import type { StoredAudit } from "@/types/stored-audit";

import { Container } from "./container";
import { SiteHeader } from "./site-header";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <SiteHeader />
      <main className="relative">
        <section id="top" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, oklch(0.66 0.22 295 / 0.35), transparent)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-[-120px] top-40 h-[320px] w-[320px] rounded-full blur-2xl"
            style={{ background: "radial-gradient(closest-side, oklch(0.7 0.14 232 / 0.35), transparent)" }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pt-28 lg:pt-32">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <motion.a
                href="#features"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                New · Aethra v1 AI infrastructure visibility
                <ArrowRight className="h-3 w-3" />
              </motion.a>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
              >
                <span className="text-gradient">Optimize AI spend</span>
                <br />
                intelligently.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
              >
                AI infrastructure visibility for modern startups. Audit your stack in 60 seconds and uncover overspending, redundant tools, and underused seats.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
              >
                <Button variant="hero" size="xl" asChild className="group">
                  <a href="/audit">
                    Run free audit
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <Button variant="glow" size="xl" asChild>
                  <a href="#how-it-works">How it works</a>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> SOC 2 ready
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Results in 60s
                </span>
                <span>No credit card required</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto mt-16 max-w-6xl"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </section>
        <LogoCloud />
        <Features />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <ConsultationCta />
        <Faq />
        <Footer />
      </main>
    </div>
  );
}

function Testimonials() {
  const quotes = [
    ["Aethra found two redundant AI subscriptions before our finance review even started.", "Maya Chen", "COO, VoltScale"],
    ["The audit reads like a sharp infrastructure analyst, not a generic SaaS report.", "Ishan Rao", "Founder, Northstar ML"],
    ["We used the recommendations to trim spend without slowing down engineering.", "Elena Brooks", "VP Engineering, Kestrel"],
  ];

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-primary">Teams</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for operators who need the AI bill to make sense.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quotes.map(([quote, name, role]) => (
            <article key={name} className="rounded-2xl border border-border bg-card/40 p-6 shadow-card">
              <p className="text-sm leading-6 text-foreground/90">&ldquo;{quote}&rdquo;</p>
              <div className="mt-6">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function DashboardPreview() {
  const { user, isInitialized } = useAuth();
  const userId = user?.id;
  const [audits, setAudits] = useState<StoredAudit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve().then(() => {
      if (!cancelled) setIsLoading(true);
    });

    listAuditsForUser(userId)
      .then((records) => {
        if (!cancelled) setAudits(records);
      })
      .catch(() => {
        if (!cancelled) setAudits([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isInitialized && userId) {
    return <AuthenticatedDashboardPreview audits={audits} isLoading={isLoading} />;
  }

  return <AnonymousDashboardPreview />;
}

interface DemoHighlight {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
}

interface DemoRecommendation {
  title: string;
  savings: string;
}

function createDemoPreviewData() {
  let seed = 92821;
  const next = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };

  const monthlySavings = 3000 + Math.round(next() * 900);
  const duplicateSpend = 750 + Math.round(next() * 450);
  const recommendationCount = 6 + Math.round(next() * 2);
  const bars = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, index) => ({
    label,
    current: 78 + index * 5 + Math.round(next() * 7),
    optimized: 60 - index * 2 - Math.round(next() * 5),
  }));

  return {
    highlights: [
      { label: "Projected monthly savings", value: `$${monthlySavings.toLocaleString()}`, meta: "after license cleanup", icon: TrendingDown },
      { label: "Duplicate spend found", value: `$${duplicateSpend.toLocaleString()}`, meta: "across 3 tool overlaps", icon: CircleDollarSign },
      { label: "Action plan", value: String(recommendationCount), meta: "ranked recommendations", icon: Activity },
    ] satisfies DemoHighlight[],
    bars,
    annualSavings: `$${Math.round((monthlySavings * 12) / 1000)}k annualized savings`,
    recommendations: [
      { title: "Consolidate AI coding seats", savings: `$${(920 + Math.round(next() * 280)).toLocaleString()}/mo` },
      { title: "Move research users to usage-based billing", savings: `$${(720 + Math.round(next() * 240)).toLocaleString()}/mo` },
      { title: "Cancel dormant image generation seats", savings: `$${(360 + Math.round(next() * 120)).toLocaleString()}/mo` },
    ] satisfies DemoRecommendation[],
  };
}

const demoPreviewData = createDemoPreviewData();

function AnonymousDashboardPreview() {
  const demoHighlights = demoPreviewData.highlights;
  const demoBars = demoPreviewData.bars;
  const demoRecommendations = demoPreviewData.recommendations;

  return (
    <div className="mx-auto mt-16 max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-primary/25 bg-card/70 shadow-elevated backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-primary sm:inline">Demo dashboard preview</span>
          <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] text-primary">Sample data</span>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" />
              Preview mode
            </div>
            <h3 className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
              See the kind of savings story your dashboard will build.
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              This mock workspace uses sample audit data to preview the insights, savings calls, and next-best actions Aethra tracks after you sign in.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {demoHighlights.map(({ label, value, meta, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border/60 bg-background/35 p-4">
                  <Icon className="mb-3 h-4 w-4 text-primary" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="rounded-xl border border-border/60 bg-background/35 p-4">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Sample spend path</p>
                  <p className="mt-1 text-xs text-muted-foreground">Current plan vs optimized run-rate</p>
                </div>
                <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                  {demoPreviewData.annualSavings}
                </span>
              </div>
              <div className="flex h-52 items-end gap-2">
                {demoBars.map(({ label, current, optimized }) => (
                  <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-44 w-full items-end gap-1 rounded-lg border border-border/50 bg-card/35 p-1.5">
                      <div className="w-1/2 rounded-t bg-primary/70" style={{ height: `${current}%` }} />
                      <div className="w-1/2 rounded-t bg-emerald-300/70" style={{ height: `${optimized}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.85fr]">
              <div className="rounded-xl border border-border/60 bg-background/35 p-4">
                <p className="text-sm font-medium">Top sample recommendations</p>
                <div className="mt-4 space-y-3">
                  {demoRecommendations.map(({ title, savings }) => (
                    <div key={title} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-card/40 px-3 py-2">
                      <span className="min-w-0 truncate text-xs">{title}</span>
                      <span className="shrink-0 text-xs text-emerald-200">{savings}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/35 p-4">
                <div className="absolute inset-x-4 bottom-4 top-16 rounded-xl border border-dashed border-border/70 bg-card/30 blur-[1px]" />
                <div className="relative">
                  <LockKeyhole className="mb-4 h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">Personal history locked</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Login to access your personalized AI spend dashboard.
                  </p>
                  <Button variant="hero" size="sm" asChild className="mt-5">
                    <a href="/login?next=/dashboard">Login to unlock</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedDashboardPreview({ audits, isLoading }: { audits: StoredAudit[]; isLoading: boolean }) {
  const analytics = useMemo(() => buildDashboardAnalytics(audits), [audits]);
  const latestAudits = audits.slice(0, 2);

  return (
    <div className="mx-auto mt-16 max-w-6xl">
      <div className="glass overflow-hidden rounded-2xl shadow-elevated">
        <div className="flex items-center justify-between border-b border-border/60 bg-card/50 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">Your dashboard preview</span>
          <span className="text-[10px] text-emerald-200">Live account</span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="grid gap-3 md:col-span-1">
            <RealMetric label="Monthly spend" value={isLoading ? "..." : `$${analytics.monthlySpendUsd.toFixed(0)}`} meta="From saved audits" icon={CircleDollarSign} />
            <RealMetric label="Annualized savings" value={isLoading ? "..." : `$${analytics.annualSavingsUsd.toFixed(0)}`} meta="Projected opportunity" icon={TrendingDown} />
            <RealMetric label="Recommendations" value={isLoading ? "..." : String(analytics.recommendationCount)} meta="Across visible history" icon={Activity} />
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 md:col-span-2">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Authenticated dashboard</p>
                <p className="text-sm font-medium">Real saved audit snapshot</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard">Open dashboard</a>
              </Button>
            </div>
            {isLoading ? (
              <div className="grid h-48 place-items-center rounded-xl border border-dashed border-border bg-background/30 text-sm text-muted-foreground">
                Loading your saved audits...
              </div>
            ) : audits.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="flex h-48 items-end gap-2">
                  {(analytics.spendTrend.length ? analytics.spendTrend : []).slice(-6).map((point) => {
                    const max = Math.max(1, analytics.monthlySpendUsd);
                    const spendHeight = Math.max(12, Math.min(100, (point.spend / max) * 100));
                    const optimizedHeight = Math.max(12, Math.min(100, (point.optimized / max) * 100));

                    return (
                      <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <div className="flex h-40 w-full items-end gap-1 rounded-md border border-border/60 bg-background/40 p-1">
                          <div className="w-1/2 rounded-t bg-primary/70" style={{ height: `${spendHeight}%` }} />
                          <div className="w-1/2 rounded-t bg-emerald-400/65" style={{ height: `${optimizedHeight}%` }} />
                        </div>
                        <span className="max-w-full truncate text-[10px] text-muted-foreground">{point.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {latestAudits.map((audit) => (
                    <a key={audit.id} href={`/r/${audit.id}`} className="block rounded-xl border border-border bg-background/35 p-3 transition-colors hover:border-primary/40">
                      <p className="truncate text-xs font-medium">${audit.result.totalMonthlySpendUsd.toFixed(2)} monthly spend</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        ${audit.result.estimatedMonthlySavingsUsd.toFixed(2)} possible monthly savings
                      </p>
                    </a>
                  ))}
                  <Button variant="glow" size="sm" asChild className="w-full">
                    <a href="/audit">Run new audit</a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-border bg-background/30 p-6 text-center">
                <div>
                  <BarChart3 className="mx-auto mb-3 h-6 w-6 text-primary" />
                  <p className="text-sm font-medium">Your dashboard is ready for real audit data.</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Run your first audit to populate spend trends, recommendations, and report history.
                  </p>
                  <Button variant="hero" size="sm" asChild className="mt-4">
                    <a href="/audit">Run first audit</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RealMetric({
  label,
  value,
  meta,
  icon: Icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <Icon className="mb-3 h-4 w-4 text-primary" />
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{meta}</p>
    </div>
  );
}
