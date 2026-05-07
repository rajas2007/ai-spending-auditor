import { Building2, Mail, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            AI infrastructure visibility for modern startups.
          </p>
          <div className="mt-5 flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="transition-colors hover:text-foreground">
              <Sparkles className="h-4 w-4" />
            </a>
            <a href="#" aria-label="GitHub" className="transition-colors hover:text-foreground">
              <Building2 className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="transition-colors hover:text-foreground">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <FooterCol title="Product" links={["Features", "Pricing", "Audit", "Changelog"]} />
        <FooterCol title="Company" links={["About", "Careers", "Customers", "Contact"]} />
        <FooterCol title="Legal" links={["Privacy", "Terms", "Security", "DPA"]} />
      </div>
      <div className="border-t border-border/60 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Aethra Labs, Inc. All rights reserved.</span>
          <span>Made with intent.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
