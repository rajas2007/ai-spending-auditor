const logos = [
  "OpenAI",
  "Anthropic",
  "Cursor",
  "Notion AI",
  "GitHub Copilot",
  "Perplexity",
  "Linear",
  "Vercel",
];

export function LogoCloud() {
  return (
    <section className="relative border-y border-border/60 bg-card/20 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Auditing AI stacks at fast-moving startups
        </p>
        <div className="mt-6 grid grid-cols-2 items-center gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
          {logos.map((logo) => (
            <div
              key={logo}
              className="text-center text-sm font-medium tracking-tight text-muted-foreground/80 transition-colors hover:text-foreground"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
