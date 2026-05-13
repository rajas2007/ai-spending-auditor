"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Download, Lock, Send, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuditResults } from "@/components/audit/audit-results";
import { ProductShell } from "@/components/layout/product-shell";
import { Button } from "@/components/ui/button";
import { getAuditForUser } from "@/lib/audit-storage";
import { debugAuditStructure } from "@/lib/audit-normalization";
import { exportAuditToPDF } from "@/lib/export-pdf";
import type { StoredAudit } from "@/types/stored-audit";

interface ReportRouteProps {
  reportId: string;
  initialAudit?: StoredAudit | null;
  initialError?: string | null;
}

export function ReportRoute({ reportId, initialAudit, initialError }: ReportRouteProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [audit, setAudit] = useState<StoredAudit | null | undefined>(initialAudit);
  const [error, setError] = useState<string | null | undefined>(initialError);
  const [isLoading, setIsLoading] = useState(initialAudit === undefined && initialError === undefined && Boolean(userId));
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (initialAudit !== undefined || initialError !== undefined) {
      if (initialAudit) {
        debugAuditStructure("ReportRoute: initialAudit from server", initialAudit);
      }
      return;
    }

    if (!userId) {
      setIsLoading(false);
      setError("This report is available only when you are signed in.");
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setAudit(null);

    getAuditForUser(userId, reportId)
      .then((record) => {
        if (cancelled) return;
        if (record) {
          debugAuditStructure("ReportRoute: audit loaded from Supabase", record);
        }
        setAudit(record);
        setError(record ? null : "This report was not found in your workspace.");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load this report.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialAudit, initialError, reportId, userId]);

  useEffect(() => {
    if (!copyStatus) return;
    const timeout = window.setTimeout(() => setCopyStatus(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  async function handleShare() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (!baseUrl) {
      setCopyStatus("Unable to determine report URL.");
      return;
    }
    const url = `${baseUrl}/r/${reportId}`;

    setIsCopying(true);
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

      setCopyStatus("Link copied to clipboard.");
    } catch {
      setCopyStatus("Copy failed — select and copy the link manually.");
    } finally {
      setIsCopying(false);
    }
  }

  async function handleExport() {
    if (!audit) return;

    setIsExporting(true);
    try {
      // For public reports, we might not have the full profile, but we can try to get it from auth if available
      // or just export without company name. The utility handles undefined companyName.
      await exportAuditToPDF(audit);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <ProductShell>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Public shareable report
          </div>
          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">Aethra optimization report.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Report <span className="break-all font-mono text-foreground">{reportId}</span> summarizes AI spend, savings, and recommendations in a public-friendly view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="glow" size="lg" onClick={handleShare} disabled={isCopying || !audit}>
            {copyStatus ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {isCopying ? "Copying…" : copyStatus || "Share link"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleExport}
            disabled={isExporting || !audit}
          >
            {isExporting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Public report access</p>
            <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
              This report loads data from a shared audit record. It is safe for public display because it excludes private profile and auth details.
            </p>
          </div>
        </div>
      </div>

      {copyStatus ? (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          {copyStatus}
        </div>
      ) : null}

      {isLoading ? (
        <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Loading report intelligence...</div>
      ) : null}
      {error ? (
        <div className="break-words rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <AuditResults result={audit?.result ?? null} />
    </ProductShell>
  );
}
