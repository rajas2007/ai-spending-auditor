import { motion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConsultationCta() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card/80 to-card/40 p-10 shadow-elevated"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> Premium optimization
              </span>
              <h3 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Want to capture <span className="text-gradient">every dollar</span>?
              </h3>
              <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
                Book a 30-minute call with an Aethra optimization advisor. We will model multi-year savings and prepare a practical implementation plan.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="hero" size="lg" className="group">
                  <Calendar className="h-4 w-4" />
                  Book consultation
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button variant="glow" size="lg">
                  Request enterprise audit
                </Button>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Frontend placeholder. Backend scheduling integration pending.
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { k: "Avg. additional savings", v: "+18%" },
                { k: "Multi-year forecast", v: "Included" },
                { k: "Vendor negotiation memo", v: "Included" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 backdrop-blur-sm"
                >
                  <span className="text-sm text-muted-foreground">{row.k}</span>
                  <span className="text-gradient text-sm font-semibold">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
