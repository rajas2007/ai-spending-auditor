"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ArrowRight, Building2, Code2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { ProductShell } from "@/components/layout/product-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = useMemo(() => searchParams.get("next") ?? "/dashboard", [searchParams]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
      await refreshSession();
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Welcome back"
      title="Sign in to your Aethra workspace."
      description="Continue auditing AI subscriptions, reviewing savings, and sharing executive-ready reports."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" size="lg">
          <Code2 className="h-4 w-4" />
          GitHub
        </Button>
        <Button variant="outline" size="lg">
          <Mail className="h-4 w-4" />
          Google
        </Button>
      </div>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Email
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Work email</span>
          <Input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="h-11 bg-background/70"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Password</span>
          <Input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="h-11 bg-background/70"
          />
        </label>
        {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-5 break-words text-center text-sm text-muted-foreground">
        New to Aethra?{" "}
        <a href="/signup" className="text-primary hover:text-primary/80">
          Create a workspace
        </a>
      </p>
    </AuthFrame>
  );
}

export function SignupPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    teamSize: "",
    monthlyAiSpendUsd: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signUpWithEmail({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        company: form.company,
        teamSize: Number(form.teamSize) || undefined,
        monthlyAiSpendUsd: Number(form.monthlyAiSpendUsd.replace(/[$,]/g, "")) || undefined,
      });
      await refreshSession();
      router.replace("/audit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your workspace.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFrame
      eyebrow="Start optimizing"
      title="Create your AI spend command center."
      description="Set up a workspace for your startup and run the first audit without connecting billing systems."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Full name</span>
            <Input required value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} placeholder="Avery Stone" className="h-11 bg-background/70" />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Work email</span>
            <Input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="avery@startup.com" className="h-11 bg-background/70" />
          </label>
        </div>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Company</span>
          <Input value={form.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Northstar AI" className="h-11 bg-background/70" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Team size</span>
            <Input type="number" min={1} value={form.teamSize} onChange={(event) => updateField("teamSize", event.target.value)} placeholder="18" className="h-11 bg-background/70" />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">Monthly AI spend</span>
            <Input value={form.monthlyAiSpendUsd} onChange={(event) => updateField("monthlyAiSpendUsd", event.target.value)} placeholder="$2,400" className="h-11 bg-background/70" />
          </label>
        </div>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">Password</span>
          <Input required minLength={6} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Minimum 6 characters" className="h-11 bg-background/70" />
        </label>
        {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating workspace..." : "Create workspace"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-5 break-words text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:text-primary/80">
          Sign in
        </a>
      </p>
    </AuthFrame>
  );
}

function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <ProductShell className="grid min-h-[calc(100vh-4rem)] items-center">
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)] lg:items-center">
        <section className="min-w-0 max-w-2xl">
          <div className="glass mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {eyebrow}
          </div>
          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 break-words text-base leading-7 text-muted-foreground">{description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["SOC 2 ready", ShieldCheck],
              ["Startup finance", Building2],
              ["AI-native audit", Sparkles],
            ].map(([label, Icon]) => (
              <div key={label as string} className="min-w-0 rounded-xl border border-border bg-card/35 p-4 text-sm">
                <Icon className="mb-3 h-4 w-4 text-primary" />
                <span className="break-words">{label as string}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="min-w-0 rounded-2xl border border-border bg-card/70 p-6 shadow-elevated sm:p-7">
          {children}
        </section>
      </div>
    </ProductShell>
  );
}
