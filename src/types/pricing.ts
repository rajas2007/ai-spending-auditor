export const SUPPORTED_AI_TOOLS = [
  "chatgpt",
  "claude",
  "cursor",
  "github-copilot",
  "gemini",
  "openai-api",
  "anthropic-api",
  "windsurf",
] as const;

export type AIToolId = (typeof SUPPORTED_AI_TOOLS)[number];

export type ToolCategory = "assistant" | "api";

export type CurrencyCode = "USD";

export type BillingCycle = "monthly" | "yearly";

export interface FlatPricing {
  model: "flat";
  amount: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
}

export interface SeatPricing {
  model: "per-seat";
  amountPerSeat: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
}

export interface UsagePricing {
  model: "usage";
  unit: "request" | "token" | "hour";
  amountPerUnit: number;
  currency: CurrencyCode;
}

export type PricingStructure = FlatPricing | SeatPricing | UsagePricing;

export interface AITool {
  id: AIToolId;
  name: string;
  category: ToolCategory;
  pricing: PricingStructure;
}

export const PLAN_IDS = ["free", "starter", "growth"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export interface PlanLimits {
  maxMembers: number;
  monthlyAuditRuns: number;
}

export interface PlanPrice {
  amount: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  prices: PlanPrice[];
  limits: PlanLimits;
}
