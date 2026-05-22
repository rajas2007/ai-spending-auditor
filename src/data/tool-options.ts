import type { AIToolId } from "@/types/pricing";

import { AI_TOOL_PRICING } from "@/config/pricing";

export interface SelectOption {
  value: string;
  label: string;
}

export const TOOL_LABELS: Record<AIToolId, string> = AI_TOOL_PRICING.reduce(
  (acc, tool) => {
    acc[tool.toolId] = tool.toolName;
    return acc;
  },
  {} as Record<AIToolId, string>,
);

export const TOOL_SELECT_OPTIONS: SelectOption[] = AI_TOOL_PRICING.map((tool) => ({
  value: tool.toolId,
  label: tool.toolName,
}));

export const TOOL_USE_CASE_OPTIONS: SelectOption[] = [
  { value: "coding", label: "Coding assistant" },
  { value: "research", label: "Research and analysis" },
  { value: "content", label: "Content and writing" },
  { value: "support", label: "Customer support automation" },
  { value: "workflow", label: "General workflow automation" },
  { value: "api-integration", label: "Backend API integration" },
];

export const BILLING_TYPE_OPTIONS: SelectOption[] = [
  { value: "flat", label: "Flat monthly price" },
  { value: "per-user", label: "Per user / seat" },
  { value: "usage-based", label: "Usage based" },
];

export const PRICE_UNKNOWN_VALUE = "custom";
export const PRICE_UNKNOWN_LABEL = "Usage-based / custom pricing";
