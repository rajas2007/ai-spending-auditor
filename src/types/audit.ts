import type { AIToolId, PlanId } from "./pricing";

export interface ToolUsageRecord {
  toolId: AIToolId;
  periodStart: string;
  periodEnd: string;
  monthlySpendUsd: number;
  seats?: number;
  requests?: number;
  tokens?: number;
}

export interface ToolAuditSummary {
  toolId: AIToolId;
  currentMonthlySpendUsd: number;
  projectedMonthlySpendUsd: number;
  potentialMonthlySavingsUsd: number;
}

export type RecommendationPriority = "low" | "medium" | "high";

export type RecommendationType =
  | "switch-plan"
  | "consolidate-tools"
  | "annual-billing"
  | "reduce-usage"
  | "replace-tool";

export interface AuditRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  toolId?: AIToolId;
  estimatedMonthlySavingsUsd: number;
  confidence: RecommendationPriority;
  actionItems: string[];
}

export interface PlanComparison {
  planId: PlanId;
  projectedMonthlyCostUsd: number;
  projectedMonthlySavingsUsd: number;
}

export interface AuditTotals {
  currentMonthlySpendUsd: number;
  projectedMonthlySpendUsd: number;
  totalMonthlySavingsUsd: number;
  savingsPercent: number;
}

export type AuditStatus = "completed" | "needs-more-data";

export interface AuditResult {
  id: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  status: AuditStatus;
  totals: AuditTotals;
  toolSummaries: ToolAuditSummary[];
  recommendations: AuditRecommendation[];
  planComparisons: PlanComparison[];
}
