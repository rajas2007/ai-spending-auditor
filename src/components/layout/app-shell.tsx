import type { ReactNode } from "react";

import { Container } from "./container";
import { SiteHeader } from "./site-header";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main className="py-6">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
