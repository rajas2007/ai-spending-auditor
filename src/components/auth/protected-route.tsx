"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ProductShell } from "@/components/layout/product-shell";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const pathname = usePathname();
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  if (!isInitialized || isLoading) {
    return (
      <ProductShell className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          Restoring your Aethra session...
        </div>
      </ProductShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <ProductShell className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <div className="max-w-md animate-in fade-in-0 zoom-in-95 rounded-2xl border border-primary/30 bg-card/80 p-6 text-center shadow-elevated backdrop-blur-xl duration-300 sm:p-7">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <p className="mb-2 text-xs uppercase tracking-wider text-primary">Private workspace</p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Sign in required</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Saved dashboards, report history, and premium analytics live inside a secure Aethra account. You can still run a free audit without signing in.
          </p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button variant="hero" size="lg" asChild>
              <a href={loginHref}>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="glow" size="lg" asChild>
              <a href={loginHref}>Continue</a>
            </Button>
          </div>
          <Button variant="link" size="sm" asChild className="mt-4">
            <a href="/audit">Run a free audit instead</a>
          </Button>
        </div>
      </ProductShell>
    );
  }

  return children;
}
