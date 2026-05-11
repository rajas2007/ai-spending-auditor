"use client";

import { useEffect, useState } from "react";
import { Download, Lock, Send, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { AuditResults } from "@/components/audit/audit-results";
import { ProductShell } from "@/components/layout/product-shell";
import { Button } from "@/components/ui/button";
import { getAuditForUser } from "@/lib/audit-storage";
import type { StoredAudit } from "@/types/stored-audit";

export function ReportRoute({ reportId }: { reportId: string }) {
  const { user } = useAuth();
  const [audit, setAudit] = useState<StoredAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getAuditForUser(user.id, reportId)
      .then((record) => {
        setAudit(record);
        setError(record ? null : "This report was not found in your workspace.");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load this report."))
      .finally(() => setIsLoading(false));
  }, [reportId, user]);

  return (
    <ProductShell>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Shareable report
          </div>
          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl">Aethra optimization report.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Report <span className="break-all font-mono text-foreground">{reportId}</span> summarizes current AI spend, projected savings, and prioritized recommendations from your stored audit history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="glow" size="lg">
            <Send className="h-4 w-4" />
            Share link
          </Button>
          <Button variant="outline" size="lg">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Workspace-scoped report</p>
            <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
              Reports are loaded from authenticated user history and are ready for future share-token or team permission layers.
            </p>
          </div>
        </div>
      </div>

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
