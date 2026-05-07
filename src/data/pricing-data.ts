import type {
  AIToolId,
  PricingStructure,
  ToolCategory,
} from "@/types/pricing";

export type ToolBillingType = "flat" | "per-user" | "usage-based";

export interface ToolPricingPlan {
  name: string;
  monthlyPriceUsd: number | null;
  billingType: ToolBillingType;
  pricing: PricingStructure;
  description: string;
  targetUseCase?: string;
}

export interface ToolPricingCatalogItem {
  toolId: AIToolId;
  toolName: string;
  category: ToolCategory;
  plans: ToolPricingPlan[];
}

// Keep one centralized source of tool pricing so future updates happen in one place.
export const AI_TOOL_PRICING: ToolPricingCatalogItem[] = [
  {
    toolId: "chatgpt",
    toolName: "ChatGPT",
    category: "assistant",
    plans: [
      {
        name: "Plus",
        monthlyPriceUsd: 20,
        billingType: "flat",
        pricing: { model: "flat", amount: 20, currency: "USD", billingCycle: "monthly" },
        description: "General-purpose premium ChatGPT access for individuals.",
        targetUseCase: "Solo developer productivity and daily ideation.",
      },
      {
        name: "Team",
        monthlyPriceUsd: 30,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 30, currency: "USD", billingCycle: "monthly" },
        description: "Collaborative ChatGPT workspace with team controls.",
        targetUseCase: "Small teams that need shared AI workflows.",
      },
    ],
  },
  {
    toolId: "claude",
    toolName: "Claude",
    category: "assistant",
    plans: [
      {
        name: "Pro",
        monthlyPriceUsd: 20,
        billingType: "flat",
        pricing: { model: "flat", amount: 20, currency: "USD", billingCycle: "monthly" },
        description: "Higher-usage Claude access for individual users.",
        targetUseCase: "Long-form reasoning, writing, and coding assistance.",
      },
      {
        name: "Team",
        monthlyPriceUsd: 30,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 30, currency: "USD", billingCycle: "monthly" },
        description: "Claude for teams with centralized administration.",
        targetUseCase: "Cross-functional teams using Claude at scale.",
      },
    ],
  },
  {
    toolId: "cursor",
    toolName: "Cursor",
    category: "assistant",
    plans: [
      {
        name: "Pro",
        monthlyPriceUsd: 20,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 20, currency: "USD", billingCycle: "monthly" },
        description: "Advanced AI coding capabilities in the Cursor editor.",
        targetUseCase: "Developers shipping features faster in IDE.",
      },
      {
        name: "Business",
        monthlyPriceUsd: 40,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 40, currency: "USD", billingCycle: "monthly" },
        description: "Cursor plan with stronger team/admin controls.",
        targetUseCase: "Engineering teams with governance requirements.",
      },
    ],
  },
  {
    toolId: "github-copilot",
    toolName: "GitHub Copilot",
    category: "assistant",
    plans: [
      {
        name: "Individual",
        monthlyPriceUsd: 10,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 10, currency: "USD", billingCycle: "monthly" },
        description: "AI pair programmer for individual developers.",
        targetUseCase: "Code completion and chat inside dev workflows.",
      },
      {
        name: "Business",
        monthlyPriceUsd: 19,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 19, currency: "USD", billingCycle: "monthly" },
        description: "Copilot for organizations with policy controls.",
        targetUseCase: "Teams that need managed AI coding assistance.",
      },
    ],
  },
  {
    toolId: "gemini",
    toolName: "Gemini",
    category: "assistant",
    plans: [
      {
        name: "Google One AI Premium",
        monthlyPriceUsd: 20,
        billingType: "flat",
        pricing: { model: "flat", amount: 20, currency: "USD", billingCycle: "monthly" },
        description: "Consumer Gemini premium plan bundled via Google One.",
        targetUseCase: "Everyday productivity across Google ecosystem.",
      },
      {
        name: "Business Standard (Workspace add-on)",
        monthlyPriceUsd: 20,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 20, currency: "USD", billingCycle: "monthly" },
        description: "Gemini for business workflows in Google Workspace.",
        targetUseCase: "Teams working deeply in Docs, Gmail, and Sheets.",
      },
    ],
  },
  {
    toolId: "openai-api",
    toolName: "OpenAI API",
    category: "api",
    plans: [
      {
        name: "Pay-as-you-go",
        monthlyPriceUsd: null,
        billingType: "usage-based",
        pricing: { model: "usage", unit: "token", amountPerUnit: 0.00001, currency: "USD" },
        description: "Usage-based API billing that scales with token consumption.",
        targetUseCase: "Backend AI features and custom product integrations.",
      },
    ],
  },
  {
    toolId: "anthropic-api",
    toolName: "Anthropic API",
    category: "api",
    plans: [
      {
        name: "Pay-as-you-go",
        monthlyPriceUsd: null,
        billingType: "usage-based",
        pricing: { model: "usage", unit: "token", amountPerUnit: 0.000015, currency: "USD" },
        description: "Claude API usage billing by model and token volume.",
        targetUseCase: "Custom apps needing advanced reasoning via API.",
      },
    ],
  },
  {
    toolId: "windsurf",
    toolName: "Windsurf",
    category: "assistant",
    plans: [
      {
        name: "Pro",
        monthlyPriceUsd: 15,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 15, currency: "USD", billingCycle: "monthly" },
        description: "AI-native coding experience for individual developers.",
        targetUseCase: "Fast code generation and refactoring in IDE workflows.",
      },
      {
        name: "Teams",
        monthlyPriceUsd: 30,
        billingType: "per-user",
        pricing: { model: "per-seat", amountPerSeat: 30, currency: "USD", billingCycle: "monthly" },
        description: "Shared Windsurf environment with team management.",
        targetUseCase: "Small engineering teams standardizing on one AI IDE.",
      },
    ],
  },
];

export const AI_TOOL_PRICING_BY_ID: Record<AIToolId, ToolPricingCatalogItem> =
  AI_TOOL_PRICING.reduce(
    (acc, item) => {
      acc[item.toolId] = item;
      return acc;
    },
    {} as Record<AIToolId, ToolPricingCatalogItem>,
  );
