import { NextResponse } from "next/server";

import { generatePersonalizedAuditSummary } from "@/lib/anthropic";
import { attachAuditSummary, buildDeterministicAuditSummary } from "@/lib/audit-summary";
import type { AuditEngineInput, AuditEngineResult } from "@/lib/audit-engine";

export async function POST(request: Request) {
  let payload: { input?: AuditEngineInput; result?: AuditEngineResult };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid audit summary request." }, { status: 400 });
  }

  if (!payload.input || !payload.result) {
    return NextResponse.json({ error: "Audit input and result are required." }, { status: 400 });
  }

  const summary = await generatePersonalizedAuditSummary({
    input: payload.input,
    result: payload.result,
  });

  return NextResponse.json({
    result: attachAuditSummary(payload.result, summary),
  });
}

export async function GET() {
  return NextResponse.json({
    fallbackAvailable: true,
    summaryPreview: buildDeterministicAuditSummary({
      input: { teamSize: 1, primaryUseCase: "workflow", tools: [] },
      result: {
        totalMonthlySpendUsd: 0,
        totalAnnualSpendUsd: 0,
        estimatedMonthlySavingsUsd: 0,
        estimatedAnnualSavingsUsd: 0,
        optimizationScore: 72,
        recommendations: [],
        toolBreakdown: [],
      },
    }),
  });
}
