import { TOOL_LABELS } from "@/data/tool-options";
import type { AuditEngineInput, AuditEngineResult } from "@/lib/audit-engine";

export interface AuditSummaryPayload {
  input: AuditEngineInput;
  result: AuditEngineResult;
}

export interface AuditSummaryResult {
  summary: string;
  source: "ai" | "fallback";
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function toolLabel(toolId: keyof typeof TOOL_LABELS) {
  return TOOL_LABELS[toolId] ?? toolId;
}

function getTopRecommendation(result: AuditEngineResult) {
  return [...result.recommendations].sort(
    (a, b) => b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd,
  )[0];
}

export function buildDeterministicAuditSummary({ input, result }: AuditSummaryPayload): string {
  const topRecommendation = getTopRecommendation(result);
  const toolNames = result.toolBreakdown.map((tool) => toolLabel(tool.toolId));
  const toolPhrase =
    toolNames.length === 0
      ? "the submitted AI stack"
      : toolNames.length === 1
        ? toolNames[0]
        : `${toolNames.slice(0, -1).join(", ")} and ${toolNames[toolNames.length - 1]}`;
  const optimizedSpend = Math.max(0, result.totalMonthlySpendUsd - result.estimatedMonthlySavingsUsd);

  if (!topRecommendation || result.estimatedMonthlySavingsUsd <= 0) {
    return `This audit reviewed ${toolPhrase} for a ${input.teamSize}-person team and found current AI spend of ${formatCurrency(result.totalMonthlySpendUsd)} per month. The deterministic audit rules did not identify a material savings opportunity, giving the stack an optimization score of ${result.optimizationScore}. Continue monitoring seats, plan fit, and usage patterns as team needs change so efficient spend does not drift over time.`;
  }

  return `This audit reviewed ${toolPhrase} for a ${input.teamSize}-person team and found current AI spend of ${formatCurrency(result.totalMonthlySpendUsd)} per month. Rule-based analysis estimates ${formatCurrency(result.estimatedMonthlySavingsUsd)} in monthly savings, reducing optimized run-rate spend to about ${formatCurrency(optimizedSpend)}. The clearest opportunity is: ${topRecommendation.title}. ${topRecommendation.suggestedAction} With an optimization score of ${result.optimizationScore}, the priority is disciplined plan fit and consolidation, not broad cuts.`;
}

export function buildAuditSummaryPrompt({ input, result }: AuditSummaryPayload): string {
  const optimizedSpend = Math.max(0, result.totalMonthlySpendUsd - result.estimatedMonthlySavingsUsd);
  const toolBreakdown = result.toolBreakdown.map((tool) => ({
    tool: toolLabel(tool.toolId),
    selectedPlanName: tool.selectedPlanName,
    monthlyCostUsd: tool.computedMonthlyCostUsd,
    primaryUseCase: tool.primaryUseCase,
  }));
  const recommendations = result.recommendations.map((recommendation) => ({
    title: recommendation.title,
    priority: recommendation.priority,
    estimatedMonthlySavingsUsd: recommendation.estimatedMonthlySavingsUsd,
    currentSituation: recommendation.currentSituation,
    suggestedAction: recommendation.suggestedAction,
    financialReasoning: recommendation.financialReasoning,
  }));

  return [
    "Write a concise personalized audit summary for an AI software spending audit.",
    "",
    "Tone requirements:",
    "- Professional and financially credible",
    "- Clear, practical, and not promotional",
    "- About 100 words",
    "- One paragraph only",
    "- No markdown",
    "",
    "Grounding rules:",
    "- Use only the audit inputs and calculated outputs below.",
    "- Do not invent savings, benchmarks, contract terms, usage, vendors, or risks.",
    "- Do not perform new calculations except basic wording around provided totals.",
    "- The audit math is deterministic and already complete; only summarize it.",
    "",
    "Audit data:",
    JSON.stringify(
      {
        teamSize: input.teamSize,
        primaryUseCase: input.primaryUseCase,
        totals: {
          totalMonthlySpendUsd: result.totalMonthlySpendUsd,
          totalAnnualSpendUsd: result.totalAnnualSpendUsd,
          estimatedMonthlySavingsUsd: result.estimatedMonthlySavingsUsd,
          estimatedAnnualSavingsUsd: result.estimatedAnnualSavingsUsd,
          optimizedMonthlySpendUsd: optimizedSpend,
          optimizationScore: result.optimizationScore,
        },
        toolBreakdown,
        recommendations,
      },
      null,
      2,
    ),
  ].join("\n");
}

export function attachAuditSummary(
  result: AuditEngineResult,
  summary: AuditSummaryResult,
): AuditEngineResult {
  return {
    ...result,
    personalizedSummary: summary.summary,
    summarySource: summary.source,
    summaryGeneratedAt: new Date().toISOString(),
  };
}
