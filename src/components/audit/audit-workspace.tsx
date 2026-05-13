"use client";

import { useState } from "react";
import { Check, Download, Save, Share2, ShieldCheck, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuditResults } from "@/components/audit/audit-results";
import { AuditForm } from "@/components/forms/audit-form";
import { LeadForm } from "@/components/forms/lead-form";
import { ProductShell } from "@/components/layout/product-shell";
import { Button } from "@/components/ui/button";
import { attachAuditSummary, buildDeterministicAuditSummary } from "@/lib/audit-summary";
import { saveAudit } from "@/lib/audit-storage";
import { debugAuditStructure } from "@/lib/audit-normalization";
import { exportAuditToPDF } from "@/lib/export-pdf";
import type { AuditEngineInput, AuditEngineResult } from "@/lib/audit-engine";
import type { StoredAudit } from "@/types/stored-audit";

export function AuditWorkspace() {
  const { user, profile } = useAuth();
  const [result, setResult] = useState<AuditEngineResult | null>(null);
  const [savedAudit, setSavedAudit] = useState<StoredAudit | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  async function generateSummary(nextResult: AuditEngineResult, input: AuditEngineInput) {
    setIsGeneratingSummary(true);

    try {
      const response = await fetch("/api/audit-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, result: nextResult }),
      });

      if (!response.ok) {
        throw new Error("Summary service unavailable.");
      }

      const data = (await response.json()) as { result?: AuditEngineResult };
      if (!data.result?.personalizedSummary) {
        throw new Error("Summary response was empty.");
      }

      return data.result;
    } catch {
      return attachAuditSummary(nextResult, {
        summary: buildDeterministicAuditSummary({ input, result: nextResult }),
        source: "fallback",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  async function handleResults(nextResult: AuditEngineResult, input: AuditEngineInput) {
    setResult(nextResult);
    setSavedAudit(null);
    setSaveError(null);

    const summarizedResult = await generateSummary(nextResult, input);
    setResult(summarizedResult);

    // Save the audit to Supabase to generate a shareable ID (required for email/reports)
    // We now allow guest audits (null user_id) in the DB
    setIsSaving(true);
    try {
      const audit = await saveAudit({
        userId: user?.id, // Can be undefined for guests
        input,
        result: summarizedResult,
      });
      
      console.log("[AUDIT DEBUG] Saved audit:", audit.id);
      setSavedAudit(audit);
    } catch (error) {
      console.error("[AUDIT ERROR] Save failed:", error);
      setSaveError(error instanceof Error ? error.message : "Audit completed but could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!savedAudit) return;

    const url = `${window.location.origin}/r/${savedAudit.id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!successful) {
          throw new Error("copy_failed");
        }
      }
      setCopyStatus("Link copied!");
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus("Failed to copy");
      setTimeout(() => setCopyStatus(null), 3000);
    }
  }

  async function handleExport() {
    if (!savedAudit) return;

    setIsExporting(true);
    try {
      await exportAuditToPDF(savedAudit, profile?.company || profile?.fullName);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <ProductShell>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0 max-w-3xl">
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Dedicated audit workspace
          </div>
          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">
            Model your AI stack and uncover spend leaks.
          </h1>
          <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-muted-foreground sm:text-base">
            Use the live Aethra audit engine to compare plans, seats, usage intent, and monthly spend. Results update from the same pricing and recommendation logic used across the app.
          </p>
          <p className="mt-3 break-words text-xs text-muted-foreground">
            {!user
              ? "Guest audit: run the full analysis now. Sign in only when you want to save history, share reports, or unlock premium analytics."
              : profile?.subscriptionTier === "pro"
              ? "Pro workspace: unlimited audit history is enabled."
              : "Free workspace: your latest 5 audits remain fully visible in history."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <>
              <Button 
                variant="glow" 
                size="lg" 
                onClick={handleShare} 
                disabled={!savedAudit || isSaving}
              >
                {copyStatus === "Link copied!" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                {copyStatus || "Share link"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleExport}
                disabled={!savedAudit || isExporting}
              >
                {isExporting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </>
          ) : (
            <Button variant="glow" size="lg" asChild>
              <a href="/login?next=/audit">
                <Save className="h-4 w-4" />
                Save history
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {[
          ["Read-only analysis", "No billing connection required for this free audit."],
          ["Benchmark pricing", "Powered by the existing Aethra pricing dataset."],
          ["Actionable savings", "Recommendations are ranked by monthly impact."],
        ].map(([title, body]) => (
          <div key={title} className="min-w-0 rounded-xl border border-border bg-card/35 p-4">
            <ShieldCheck className="mb-3 h-4 w-4 text-emerald-300" />
            <p className="break-words text-sm font-medium">{title}</p>
            <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section id="audit">
          <AuditForm onResults={handleResults} isBusy={isGeneratingSummary || isSaving} />
        </section>
        <section id="results">
          {isGeneratingSummary ? (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
              Generating personalized audit summary...
            </div>
          ) : null}
          {isSaving ? (
            <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
              Saving this audit to your workspace...
            </div>
          ) : null}
          {savedAudit ? (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Audit saved to dashboard history.</span>
              <a href={`/r/${savedAudit.id}`} className="text-primary hover:text-primary/80">
                Open report
              </a>
            </div>
          ) : null}
          {saveError ? (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-200">
              {saveError}
            </div>
          ) : null}
          
          {savedAudit && (
            <div className="mb-6">
              <LeadForm auditId={savedAudit.id} />
            </div>
          )}

          <AuditResults result={result} isSummaryLoading={isGeneratingSummary} />
        </section>
      </div>
    </ProductShell>
  );
}
