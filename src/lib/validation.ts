import { z } from "zod";

import { SUPPORTED_AI_TOOLS } from "@/types/pricing";
import { AUDIT_USE_CASES, type AuditFormValues, type AuditToolFormEntry } from "@/types/forms";

const toolIdSchema = z.enum(SUPPORTED_AI_TOOLS);
const useCaseSchema = z.enum(AUDIT_USE_CASES);

const optionalNumberField = (label: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      if (typeof value === "number") return Number.isNaN(value) ? undefined : value;
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return value;
    },
    z.number().min(0, `${label} must be zero or greater`).optional(),
  );

const seatCountSchema = optionalNumberField("Seat count").refine(
  (value) => value === undefined || Number.isInteger(value),
  "Seat count must be a whole number",
);

export const auditToolEntrySchema = z
  .object({
    toolId: toolIdSchema,
    isSelected: z.boolean().default(true),
    selectedPlanName: z.string().trim(),
    monthlySpendUsd: optionalNumberField("Monthly spend"),
    seatCount: seatCountSchema,
    primaryUseCase: useCaseSchema,
  })
  .superRefine((value, ctx) => {
    if (!value.isSelected) return;

    if (!value.selectedPlanName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedPlanName"],
        message: "Plan selection is required for selected tools",
      });
    }
  });

export const leadCaptureSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
    workEmail: z.email("Enter a valid email address").optional(),
    companyName: z.string().trim().min(2, "Company name must be at least 2 characters").optional(),
  })
  .partial();

export const auditFormSchema = z
  .object({
    teamSize: z.coerce.number().int().min(1, "Team size must be at least 1"),
    primaryUseCase: useCaseSchema,
    tools: z.array(auditToolEntrySchema).min(1, "Add at least one tool"),
    leadCapture: leadCaptureSchema.optional(),
    website: z.string().optional(), // Honeypot field
  })
  .superRefine((value, ctx) => {
    const selectedCount = value.tools.filter((tool) => tool.isSelected).length;
    if (selectedCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tools"],
        message: "Select at least one AI tool",
      });
    }
  });

export type AuditFormSchemaValues = z.infer<typeof auditFormSchema>;

export function createDefaultToolEntry(toolId: AuditToolFormEntry["toolId"]): AuditToolFormEntry {
  return {
    toolId,
    isSelected: false,
    selectedPlanName: "",
    monthlySpendUsd: undefined,
    seatCount: undefined,
    primaryUseCase: "coding",
  };
}

// Using all supported tools by default keeps the form deterministic and easy to extend.
export function createDefaultAuditFormValues(): AuditFormValues {
  return {
    teamSize: 1,
    primaryUseCase: "coding",
    tools: SUPPORTED_AI_TOOLS.map((toolId) => createDefaultToolEntry(toolId)),
  };
}
