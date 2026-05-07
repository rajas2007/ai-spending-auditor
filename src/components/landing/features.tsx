import { motion } from "framer-motion";
import { Bell, LineChart, Lock, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { SectionHeader } from "@/components/landing/section-header";

const features = [
  {
    icon: LineChart,
    title: "Spend intelligence",
    desc: "Real-time visibility across every AI tool, plan, and seat in your stack.",
  },
  {
    icon: Sparkles,
    title: "AI-native recommendations",
    desc: "Severity-ranked actions that quantify exactly how much you'll save each month.",
  },
  {
    icon: Workflow,
    title: "Plan rightsizing",
    desc: "Detect underused seats, redundant tools, and better-fit plans automatically.",
  },
  {
    icon: Bell,
    title: "Proactive alerts",
    desc: "Get notified when usage drifts, prices change, or contracts come up for renewal.",
  },
  {
    icon: ShieldCheck,
    title: "Vendor benchmarks",
    desc: "Compare your spend against anonymized peers in your stage and segment.",
  },
  {
    icon: Lock,
    title: "Enterprise-grade security",
    desc: "Read-only access, SSO, and SOC 2 controls. Your billing data stays yours.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Platform"
          title="Financial intelligence for your AI stack"
          description="Aethra continuously audits your tools and surfaces every dollar of optimization from dormant seats to redundant subscriptions."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 transition-all hover:border-primary/40 hover:bg-card/60"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
