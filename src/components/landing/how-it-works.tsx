import { motion } from "framer-motion";

import { SectionHeader } from "@/components/landing/section-header";

const steps = [
  {
    n: "01",
    title: "Add your AI tools",
    desc: "Drop in your stack, including OpenAI, Cursor, Anthropic, Copilot, and more. Takes under a minute.",
  },
  {
    n: "02",
    title: "Aethra audits in real time",
    desc: "Our engine cross-references plans, seats, and benchmark pricing to find every optimization.",
  },
  {
    n: "03",
    title: "Save with confidence",
    desc: "Apply prioritized recommendations and watch your monthly burn drop, line by line.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="How it works" title="From signup to savings in 60 seconds" />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-2xl border border-border bg-card/40 p-6"
            >
              <div className="font-mono text-xs text-primary/80">{step.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
