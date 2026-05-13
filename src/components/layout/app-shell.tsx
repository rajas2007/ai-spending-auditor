"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

const ConsultationCta = dynamic(() => import("@/components/landing/consultation-cta").then(mod => mod.ConsultationCta));
const Faq = dynamic(() => import("@/components/landing/faq").then(mod => mod.Faq));
const Features = dynamic(() => import("@/components/landing/features").then(mod => mod.Features));
const Footer = dynamic(() => import("@/components/landing/footer").then(mod => mod.Footer));
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then(mod => mod.HowItWorks));
const LogoCloud = dynamic(() => import("@/components/landing/logo-cloud").then(mod => mod.LogoCloud));
const Pricing = dynamic(() => import("@/components/landing/pricing").then(mod => mod.Pricing));
const Stats = dynamic(() => import("@/components/landing/stats").then(mod => mod.Stats));

import { Button } from "@/components/ui/button";

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
  return (
    <div className="mx-auto mt-16 max-w-6xl">
      <div className="glass overflow-hidden rounded-2xl shadow-elevated">
        <div className="flex items-center justify-between border-b border-border/60 bg-card/50 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Aethra dashboard preview</span>
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="grid gap-3 md:col-span-1">
            {[
              ["Monthly savings", "$3,300", "+27% vs Q1"],
              ["Optimization score", "84", "Top 12% of peers"],
              ["Redundant tools", "3", "Action recommended"],
            ].map(([label, value, meta]) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card/60 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{meta}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Spend trend</p>
                <p className="text-sm font-medium">Current vs optimized</p>
              </div>
              <p className="text-[10px] text-muted-foreground">6-month projection</p>
            </div>
            <div className="flex h-48 items-end gap-2">
              {[68, 71, 74, 77, 79, 82].map((height, index) => (
                <div key={height} className="group flex-1 space-y-1">
                  <div className="relative overflow-hidden rounded-md border border-border/60 bg-background/40" style={{ height: `${height}%` }}>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/70 to-primary/20" style={{ height: "100%" }} />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-500/50 to-emerald-500/10" style={{ height: `${80 - index * 4}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

