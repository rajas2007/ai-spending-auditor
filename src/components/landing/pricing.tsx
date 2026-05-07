import { Check } from "lucide-react";

import { SectionHeader } from "@/components/landing/section-header";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free audit",
    price: "$0",
    cadence: "forever",
    desc: "Run unlimited audits. See your top optimizations.",
    features: [
      "Unlimited audits",
      "Top 6 recommendations",
      "Spend and breakdown charts",
      "CSV export",
    ],
    cta: "Run free audit",
    highlight: false,
  },
  {
    name: "Team",
    price: "$49",
    cadence: "/ month",
    desc: "For startups actively cutting AI burn.",
    features: [
      "Everything in Free",
      "Continuous monitoring",
      "Slack alerts",
      "Vendor benchmarks",
      "Priority email support",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    desc: "For >50-person engineering organizations.",
    features: [
      "SSO + SAML",
      "Custom integrations",
      "Dedicated optimization advisor",
      "Quarterly business reviews",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

interface PricingProps {
  onCta?: () => void;
}

export function Pricing({ onCta }: PricingProps) {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Pricing" title="Start free. Pay when it pays for itself." />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                tier.highlight
                  ? "border-primary/50 bg-card/70 shadow-[0_0_60px_-15px_oklch(0.66_0.22_295/0.5)]"
                  : "border-border bg-card/30"
              }`}
            >
              {tier.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              ) : null}
              <div className="text-sm font-medium text-muted-foreground">{tier.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.cadence}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={onCta} variant={tier.highlight ? "hero" : "outline"} className="mt-7" size="lg">
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
