/**
 * Audit Normalization Layer
 * 
 * Ensures retrieved audits from Supabase have identical structure to freshly generated ones.
 * Addresses data shape mismatches from JSON serialization/deserialization round-trips.
 */

import type { AuditEngineResult, AuditRecommendationDetail, AuditedToolBreakdown, UseCaseKey } from "@/lib/audit-engine";
import type { PricingSnapshot } from "@/config/pricing";
import type { RecommendationType, RecommendationPriority } from "@/types/audit";
import type { AIToolId } from "@/types/pricing";
import { SUPPORTED_AI_TOOLS } from "@/types/pricing";
import type { StoredAudit } from "@/types/stored-audit";

/**
 * Type guard for AIToolId
 */
function isValidToolId(value: unknown): value is AIToolId {
  return typeof value === "string" && (SUPPORTED_AI_TOOLS as readonly string[]).includes(value);
}

/**
 * Debug: Log complete audit structure for comparison
 */
export function debugAuditStructure() {
  // Debug logging disabled for production performance
}

/**
 * Reconstruct AuditEngineResult to ensure proper types and structure
 * Fixes issues from Supabase JSON serialization round-trip
 */
export function normalizeAuditResult(result: unknown): AuditEngineResult {
  let obj: Record<string, unknown>;

  if (typeof result === "string") {
    try {
      obj = JSON.parse(result);
    } catch {
      throw new Error("Invalid audit result structure (failed to parse string)");
    }
  } else if (result && typeof result === "object") {
    obj = result as Record<string, unknown>;
  } else {
    throw new Error("Invalid audit result structure");
  }

  // Check for double-nesting: if the data is wrapped inside a "result" key
  if (obj && typeof obj === "object" && obj.result && typeof obj.result === "object") {
    const nested = obj.result as Record<string, unknown>;
    // If the nested object looks like the real result, unwrap it
    if ("totalMonthlySpendUsd" in nested || "recommendations" in nested || "toolBreakdown" in nested || "summary" in nested) {
      obj = nested;
    }
  }

  // Handle potential field name mismatches (e.g. frontend expecting 'summary' instead of 'personalizedSummary')
  const summaryField = obj.personalizedSummary ?? obj.summary;

  // Ensure numeric fields are actual numbers
  const totalMonthlySpendUsd = toNumber(obj.totalMonthlySpendUsd, 0);
  const totalAnnualSpendUsd = toNumber(obj.totalAnnualSpendUsd, 0);
  const estimatedMonthlySavingsUsd = toNumber(obj.estimatedMonthlySavingsUsd, 0);
  const estimatedAnnualSavingsUsd = toNumber(obj.estimatedAnnualSavingsUsd, 0);
  const optimizationScore = toNumber(obj.optimizationScore, 50);

  // Ensure recommendations array exists and has proper structure
  const recommendations = Array.isArray(obj.recommendations)
    ? obj.recommendations.map((rec) => normalizeRecommendation(rec))
    : [];

  // Ensure tool breakdown array exists and has proper structure
  const toolBreakdown = Array.isArray(obj.toolBreakdown)
    ? obj.toolBreakdown.map((tool) => normalizeToolBreakdown(tool))
    : [];

  return {
    pricingVersionUsed: toString(obj.pricingVersionUsed),
    pricingSnapshotUsed: normalizePricingSnapshot(obj.pricingSnapshotUsed),
    totalMonthlySpendUsd,
    totalAnnualSpendUsd,
    estimatedMonthlySavingsUsd,
    estimatedAnnualSavingsUsd,
    optimizationScore,
    personalizedSummary: toString(summaryField),
    summarySource: (obj.summarySource === "ai" || obj.summarySource === "fallback")
      ? obj.summarySource
      : undefined,
    summaryGeneratedAt: toString(obj.summaryGeneratedAt),
    recommendations,
    toolBreakdown,
  };
}

function normalizePricingSnapshot(value: unknown): PricingSnapshot | undefined {
  if (!value || typeof value !== "object") return undefined;

  const obj = value as Record<string, unknown>;
  if (typeof obj.version !== "string" || !Array.isArray(obj.tools)) return undefined;

  return {
    version: obj.version,
    tools: obj.tools,
  } as PricingSnapshot;
}

/**
 * Normalize a single recommendation to ensure all fields are present and properly typed
 */
function normalizeRecommendation(rec: unknown): AuditRecommendationDetail {
  if (!rec || typeof rec !== "object") {
    throw new Error("Invalid recommendation structure");
  }

  const obj = rec as Record<string, unknown>;
  const type = isValidRecommendationType(obj.type) ? obj.type : "reduce-usage";
  const priority = isValidPriority(obj.priority) ? obj.priority : "low";
  const toolId = isValidToolId(obj.toolId) ? obj.toolId : undefined;

  return {
    id: String(obj.id ?? "unknown"),
    type,
    priority,
    title: String(obj.title ?? ""),
    description: String(obj.description ?? ""),
    toolId,
    estimatedMonthlySavingsUsd: toNumber(obj.estimatedMonthlySavingsUsd, 0),
    confidence: priority,
    actionItems: Array.isArray(obj.actionItems)
      ? obj.actionItems.map((item) => String(item))
      : [],
    currentSituation: String(obj.currentSituation ?? ""),
    suggestedAction: String(obj.suggestedAction ?? ""),
    financialReasoning: String(obj.financialReasoning ?? ""),
  };
}

/**
 * Type guard for RecommendationType
 */
function isValidRecommendationType(value: unknown): value is RecommendationType {
  return (
    value === "switch-plan" ||
    value === "consolidate-tools" ||
    value === "annual-billing" ||
    value === "reduce-usage" ||
    value === "replace-tool"
  );
}

/**
 * Type guard for RecommendationPriority
 */
function isValidPriority(value: unknown): value is RecommendationPriority {
  return value === "low" || value === "medium" || value === "high";
}

/**
 * Normalize a tool breakdown entry to ensure proper structure
 */
function normalizeToolBreakdown(tool: unknown): AuditedToolBreakdown {
  if (!tool || typeof tool !== "object") {
    throw new Error("Invalid tool breakdown structure");
  }

  const obj = tool as Record<string, unknown>;
  const toolId = isValidToolId(obj.toolId) ? obj.toolId : ("other" as AIToolId);

  return {
    toolId,
    selectedPlanName: String(obj.selectedPlanName ?? ""),
    computedMonthlyCostUsd: toNumber(obj.computedMonthlyCostUsd, 0),
    primaryUseCase: ((): UseCaseKey => {
      const val = String(obj.primaryUseCase ?? "other");
      const validCases: UseCaseKey[] = ["coding", "research", "content", "support", "workflow", "api-integration", "other"];
      return validCases.includes(val as UseCaseKey) ? (val as UseCaseKey) : "other";
    })(),
  };
}

/**
 * Safe type conversion helpers
 */
function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function toString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value || undefined;
  return String(value) || undefined;
}

/**
 * Normalize complete StoredAudit for consistency
 */
export function normalizeStoredAudit(audit: StoredAudit): StoredAudit {
  try {
    const result = normalizeAuditResult(audit.result);
    return {
      ...audit,
      result,
      pricingVersionUsed: audit.pricingVersionUsed ?? result.pricingVersionUsed,
      pricingSnapshotUsed: audit.pricingSnapshotUsed ?? result.pricingSnapshotUsed,
    };
  } catch (error) {
    console.error("[AUDIT NORMALIZE] Failed to normalize audit:", error, audit);
    // Return as-is if normalization fails - preserve original for debugging
    return audit;
  }
}
