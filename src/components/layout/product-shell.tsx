import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";

interface ProductShellProps {
  children: ReactNode;
  className?: string;
}

export function ProductShell({ children, className = "" }: ProductShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <SiteHeader />
      <main className={`relative mx-auto w-full max-w-7xl px-6 py-10 sm:py-14 ${className}`}>
        {children}
      </main>
    </div>
  );
}
