import { AI_TOOL_PRICING_BY_ID, PRICING_VERSION, getPricingSnapshot } from "@/config/pricing";
import type {
  AuditRecommendation,
  RecommendationPriority,
  RecommendationType,
} from "@/types/audit";
import type { AIToolId } from "@/types/pricing";
import type { PricingSnapshot, ToolPricingCatalogItem } from "@/config/pricing";

export type UseCaseKey =
  | "coding"
  | "research"
  | "content"
  | "support"
  | "workflow"
  | "api-integration"
  | "other";

export interface AuditInputTool {
  toolId: AIToolId;
  selectedPlanName: string;
  monthlySpendUsd?: number;
  seats?: number;
  primaryUseCase?: UseCaseKey;
}

export interface AuditEngineInput {
  tools: AuditInputTool[];
  teamSize: number;
  primaryUseCase?: UseCaseKey;
}

export interface AuditRecommendationDetail extends AuditRecommendation {
  currentSituation: string;
  suggestedAction: string;
  financialReasoning: string;
}

export interface AuditedToolBreakdown {
  toolId: AIToolId;
  selectedPlanName: string;
  computedMonthlyCostUsd: number;
  primaryUseCase: UseCaseKey;
}

export interface AuditEngineResult {
  pricingVersionUsed?: string;
  pricingSnapshotUsed?: PricingSnapshot;
  totalMonthlySpendUsd: number;
  totalAnnualSpendUsd: number;
  estimatedMonthlySavingsUsd: number;
  estimatedAnnualSavingsUsd: number;
  optimizationScore: number;
  personalizedSummary?: string;
  summarySource?: "ai" | "fallback";
  summaryGeneratedAt?: string;
  recommendations: AuditRecommendationDetail[];
  toolBreakdown: AuditedToolBreakdown[];
}

interface EvaluatedTool {
  toolId: AIToolId;
  selectedPlanName: string;
  monthlyCostUsd: number;
  seats: number;
  primaryUseCase: UseCaseKey;
}

const CODING_TOOL_IDS: AIToolId[] = [
  "cursor",
  "github-copilot",
  "windsurf",
  "chatgpt",
  "claude",
];

function normalizeUseCase(
  toolUseCase: UseCaseKey | undefined,
  fallback: UseCaseKey | undefined,
): UseCaseKey {
  return toolUseCase ?? fallback ?? "other";
}

function normalizeSeatCount(rawSeats: number | undefined, teamSize: number): number {
  if (typeof rawSeats === "number" && rawSeats > 0) return Math.floor(rawSeats);
  return Math.max(1, Math.floor(teamSize));
}

function computeMonthlyCostUsd(
  input: AuditInputTool,
  teamSize: number,
  pricingById: Record<AIToolId, ToolPricingCatalogItem> = AI_TOOL_PRICING_BY_ID,
): { monthlyCostUsd: number; seats: number } {
  const catalog = pricingById[input.toolId];
  const seats = normalizeSeatCount(input.seats, teamSize);
  const plan = catalog?.plans.find((entry) => entry.name === input.selectedPlanName);

  if (!plan) {
    return { monthlyCostUsd: Math.max(0, input.monthlySpendUsd ?? 0), seats };
  }

  if (typeof input.monthlySpendUsd === "number" && input.monthlySpendUsd >= 0) {
    return { monthlyCostUsd: input.monthlySpendUsd, seats };
  }

  if (plan.pricing.model === "flat") {
    return { monthlyCostUsd: plan.pricing.amount, seats };
  }

  if (plan.pricing.model === "per-seat") {
    return { monthlyCostUsd: plan.pricing.amountPerSeat * seats, seats };
  }

  // Usage pricing cannot be inferred without consumption; default to provided spend or zero.
  return { monthlyCostUsd: Math.max(0, input.monthlySpendUsd ?? 0), seats };
}

function isTeamOrBusinessPlan(planName: string): boolean {
  const normalized = planName.toLowerCase();
  return normalized.includes("team") || normalized.includes("business");
}

function buildRecommendation(
  index: number,
  type: RecommendationType,
  priority: RecommendationPriority,
  title: string,
  toolId: AIToolId | undefined,
  estimatedMonthlySavingsUsd: number,
  currentSituation: string,
  suggestedAction: string,
  financialReasoning: string,
): AuditRecommendationDetail {
  return {
    id: `rec-${index + 1}`,
    type,
    priority,
    title,
    description: `${currentSituation} ${suggestedAction}`,
    toolId,
    estimatedMonthlySavingsUsd: roundCurrency(estimatedMonthlySavingsUsd),
    confidence: priority,
    actionItems: [suggestedAction, financialReasoning],
    currentSituation,
    suggestedAction,
    financialReasoning,
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateOptimizationScore(totalMonthlySpendUsd: number, estimatedMonthlySavingsUsd: number): number {
  const savingsRate = totalMonthlySpendUsd > 0 ? estimatedMonthlySavingsUsd / totalMonthlySpendUsd : 0;
  return Math.max(42, Math.min(98, Math.round(72 + savingsRate * 100)));
}

function evaluateTeamPlanOverkillRule(
  evaluatedTools: EvaluatedTool[],
): AuditRecommendationDetail[] {
  const recommendations: AuditRecommendationDetail[] = [];

  evaluatedTools.forEach((tool, index) => {
    if (!isTeamOrBusinessPlan(tool.selectedPlanName) || tool.seats > 2) return;

    const savings = tool.monthlyCostUsd * 0.35;
    recommendations.push(
      buildRecommendation(
        index,
        "switch-plan",
        "high",
        "Team plan may be overkill for very small usage",
        tool.toolId,
        savings,
        `${tool.selectedPlanName} is selected with only ${tool.seats} seat(s).`,
        "Consider switching to an individual/pro plan for this tool.",
        "Small teams on team-tier pricing often pay a premium for features they may not fully use.",
      ),
    );
  });

  return recommendations;
}

function evaluateExpensiveLowSeatRule(
  evaluatedTools: EvaluatedTool[],
): AuditRecommendationDetail[] {
  const recommendations: AuditRecommendationDetail[] = [];

  evaluatedTools.forEach((tool, index) => {
    const costPerSeat = tool.monthlyCostUsd / Math.max(1, tool.seats);
    if (costPerSeat < 25 || tool.seats > 3) return;

    const savings = tool.monthlyCostUsd * 0.2;
    recommendations.push(
      buildRecommendation(
        100 + index,
        "switch-plan",
        "medium",
        "High per-seat cost with low seat count",
        tool.toolId,
        savings,
        `Current per-seat cost is about $${roundCurrency(costPerSeat)} across ${tool.seats} seat(s).`,
        "Evaluate lower-tier plans that still meet the current usage profile.",
        "Low-seat deployments on higher-priced tiers frequently leave discountable spend on the table.",
      ),
    );
  });

  return recommendations;
}

function evaluateDuplicateCodingToolsRule(
  evaluatedTools: EvaluatedTool[],
): AuditRecommendationDetail[] {
  const codingTools = evaluatedTools.filter(
    (tool) =>
      CODING_TOOL_IDS.includes(tool.toolId) &&
      (tool.primaryUseCase === "coding" || tool.primaryUseCase === "other"),
  );

  if (codingTools.length < 2) return [];

  const sortedByCostDesc = [...codingTools].sort((a, b) => b.monthlyCostUsd - a.monthlyCostUsd);
  const overlapSpend = sortedByCostDesc.slice(1).reduce((sum, tool) => sum + tool.monthlyCostUsd, 0);
  const savings = overlapSpend * 0.3;

  return [
    buildRecommendation(
      200,
      "consolidate-tools",
      "high",
      "Multiple coding assistants may overlap",
      undefined,
      savings,
      `${codingTools.length} coding-focused tools are active in the same monthly stack.`,
      "Consolidate to one primary coding assistant and keep one secondary only if clearly justified.",
      "Feature overlap across coding assistants often causes duplicate spend with limited marginal productivity gains.",
    ),
  ];
}

function evaluateRetailApiSpendRule(
  evaluatedTools: EvaluatedTool[],
): AuditRecommendationDetail[] {
  const apiTools = evaluatedTools.filter(
    (tool) => tool.toolId === "openai-api" || tool.toolId === "anthropic-api",
  );
  const apiSpend = apiTools.reduce((sum, tool) => sum + tool.monthlyCostUsd, 0);

  if (apiSpend < 200) return [];

  return [
    buildRecommendation(
      300,
      "reduce-usage",
      "medium",
      "API spend may benefit from committed credits",
      undefined,
      apiSpend * 0.1,
      `Combined API spend is $${roundCurrency(apiSpend)} per month.`,
      "Review committed-use credits or negotiated pricing as usage becomes stable.",
      "At higher spend levels, prepaid credits can reduce effective unit cost versus pure retail billing.",
    ),
  ];
}

function buildOptimizedRecommendationIfNeeded(
  recommendations: AuditRecommendationDetail[],
): AuditRecommendationDetail[] {
  if (recommendations.length > 0) return recommendations;

  return [
    buildRecommendation(
      999,
      "reduce-usage",
      "low",
      "Current setup already looks cost-efficient",
      undefined,
      0,
      "No major cost inefficiencies were detected with the current inputs.",
      "Keep monitoring usage monthly and revisit plan selection as team size or workload changes.",
      "With no strong rule trigger, aggressive optimization could create disruption without meaningful savings.",
    ),
  ];
}

function evaluateRecommendations(evaluatedTools: EvaluatedTool[]): AuditRecommendationDetail[] {
  const all = [
    ...evaluateTeamPlanOverkillRule(evaluatedTools),
    ...evaluateDuplicateCodingToolsRule(evaluatedTools),
    ...evaluateExpensiveLowSeatRule(evaluatedTools),
    ...evaluateRetailApiSpendRule(evaluatedTools),
  ];

  const deduped = all.filter(
    (recommendation, index, list) =>
      list.findIndex((item) => item.title === recommendation.title && item.toolId === recommendation.toolId) ===
      index,
  );

  return buildOptimizedRecommendationIfNeeded(deduped);
}

export function evaluateToolSpend(input: AuditEngineInput): AuditedToolBreakdown[] {
  return input.tools.map((toolInput) => {
    const { monthlyCostUsd } = computeMonthlyCostUsd(toolInput, input.teamSize);
    return {
      toolId: toolInput.toolId,
      selectedPlanName: toolInput.selectedPlanName,
      computedMonthlyCostUsd: roundCurrency(monthlyCostUsd),
      primaryUseCase: normalizeUseCase(toolInput.primaryUseCase, input.primaryUseCase),
    };
  });
}

export function runAuditEngine(input: AuditEngineInput): AuditEngineResult {
  const pricingSnapshotUsed = getPricingSnapshot();
  const pricingById = pricingSnapshotUsed.tools.reduce(
    (acc, item) => {
      acc[item.toolId] = item;
      return acc;
    },
    {} as Record<AIToolId, ToolPricingCatalogItem>,
  );

  const evaluatedTools: EvaluatedTool[] = input.tools.map((toolInput) => {
    const { monthlyCostUsd, seats } = computeMonthlyCostUsd(toolInput, input.teamSize, pricingById);
    return {
      toolId: toolInput.toolId,
      selectedPlanName: toolInput.selectedPlanName,
      monthlyCostUsd: roundCurrency(monthlyCostUsd),
      seats,
      primaryUseCase: normalizeUseCase(toolInput.primaryUseCase, input.primaryUseCase),
    };
  });

  const recommendations = evaluateRecommendations(evaluatedTools);
  const totalMonthlySpendUsd = roundCurrency(
    evaluatedTools.reduce((sum, tool) => sum + tool.monthlyCostUsd, 0),
  );
  const estimatedMonthlySavingsUsd = roundCurrency(
    recommendations.reduce((sum, recommendation) => sum + recommendation.estimatedMonthlySavingsUsd, 0),
  );

  return {
    pricingVersionUsed: PRICING_VERSION,
    pricingSnapshotUsed,
    totalMonthlySpendUsd,
    totalAnnualSpendUsd: roundCurrency(totalMonthlySpendUsd * 12),
    estimatedMonthlySavingsUsd,
    estimatedAnnualSavingsUsd: roundCurrency(estimatedMonthlySavingsUsd * 12),
    optimizationScore: calculateOptimizationScore(totalMonthlySpendUsd, estimatedMonthlySavingsUsd),
    recommendations,
    toolBreakdown: evaluatedTools.map((tool) => ({
      toolId: tool.toolId,
      selectedPlanName: tool.selectedPlanName,
      computedMonthlyCostUsd: tool.monthlyCostUsd,
      primaryUseCase: tool.primaryUseCase,
    })),
  };
}
