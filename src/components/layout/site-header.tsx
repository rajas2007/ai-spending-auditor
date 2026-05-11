"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";

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
  const { isAuthenticated, isLoading, profile, signOut } = useAuth();

  function handleAnchorClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
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
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-40 truncate text-xs text-muted-foreground lg:inline">
                {profile?.company || profile?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => void signOut()}
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
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
