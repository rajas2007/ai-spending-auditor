"use client";

import { useState } from "react";
import { Mail, Send, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const leadSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  company: z.string().min(2, "Company name is required."),
  role: z.string().min(2, "Role is required."),
  teamSize: z.string().min(1, "Team size is required."),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  auditId: string;
  onSuccess?: () => void;
}

export function LeadForm({ auditId, onSuccess }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  async function onSubmit(data: LeadFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          auditId,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to submit lead data.");
      }

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-emerald-100">Report sent!</h3>
        <p className="mt-2 text-sm text-emerald-200/70">
          Check your inbox. We've sent the full audit summary and a link to your interactive report.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/40 p-6 shadow-elevated backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Mail className="h-5 w-5 text-primary" />
          Send full report to your inbox
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get the high-resolution summary and actionable next steps delivered instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Acme Inc."
              {...register("company")}
              className={errors.company ? "border-destructive" : ""}
            />
            {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              placeholder="e.g. CTO, Head of Ops"
              {...register("role")}
              className={errors.role ? "border-destructive" : ""}
            />
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamSize">Team Size</Label>
            <Input
              id="teamSize"
              placeholder="e.g. 50-100"
              {...register("teamSize")}
              className={errors.teamSize ? "border-destructive" : ""}
            />
            {errors.teamSize && <p className="text-xs text-destructive">{errors.teamSize.message}</p>}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}

        <Button type="submit" variant="glow" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            "Sending report..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send my report
            </>
          )}
        </Button>
        <p className="text-center text-[10px] text-muted-foreground">
          By submitting, you agree to receive a one-time audit report and related optimization insights.
        </p>
      </form>
    </div>
  );
}
