"use client";

import { useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { LogOut, Menu, UserRound, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

import { Container } from "./container";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Dashboard", href: "/dashboard" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading, profile, user, signOut } = useAuth();
  const displayName = profile?.fullName || profile?.company || user?.user_metadata?.full_name || user?.email || "Aethra user";
  const displayEmail = profile?.email || user?.email || "Signed in";
  const initials = useMemo(() => {
    const source = profile?.fullName || profile?.company || user?.email || "Aethra";
    return source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [profile?.company, profile?.fullName, user?.email]);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
  }

  function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith("/#")) return;
    if (window.location.pathname !== "/") return;

    const section = document.getElementById(href.replace("/#", ""));
    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 border-b border-border/60 bg-background/60 backdrop-blur-xl" />
      <Container className="relative flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => handleAnchorClick(event, link.href)}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="hidden h-8 w-28 animate-pulse rounded-full border border-border bg-card/45 sm:inline-flex" />
          ) : isAuthenticated ? (
            <>
              <div className="hidden min-w-0 items-center gap-2 rounded-full border border-border bg-card/45 px-2.5 py-1.5 shadow-card lg:flex">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-[11px] font-semibold text-primary">
                  {initials || <UserRound className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block max-w-36 truncate text-xs font-medium text-foreground">{displayName}</span>
                  <span className="block max-w-36 truncate text-[11px] text-muted-foreground">{displayEmail}</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex" disabled={isLoading}>
              <a href="/login">Sign in</a>
            </Button>
          )}
          <Button variant="hero" size="sm" asChild className="hidden sm:inline-flex">
            <a href="/audit">Run free audit</a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </Container>
      {open ? (
        <div className="relative border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => {
                  handleAnchorClick(event, link.href);
                  setOpen(false);
                }}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button variant="hero" size="sm" asChild className="mt-2">
              <a href="/audit" onClick={() => setOpen(false)}>
                Run free audit
              </a>
            </Button>
            {isLoading ? (
              <span className="my-2 h-10 animate-pulse rounded-xl border border-border bg-card/45" />
            ) : isAuthenticated ? (
              <>
                <div className="my-2 flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card/45 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xs font-semibold text-primary">
                    {initials || <UserRound className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-sm font-medium">{displayName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{displayEmail}</span>
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <a href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </a>
              </Button>
            )}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
