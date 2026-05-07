"use client";

import { useState } from "react";

import { AuditResults } from "@/components/audit/audit-results";
import { AuditForm } from "@/components/forms/audit-form";
import { AppShell } from "@/components/layout/app-shell";
import type { AuditEngineResult } from "@/lib/audit-engine";

export default function Home() {
  const [result, setResult] = useState<AuditEngineResult | null>(null);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-2">
        <AuditForm onResults={setResult} />
        <AuditResults result={result} />
      </div>
    </AppShell>
  );
}
