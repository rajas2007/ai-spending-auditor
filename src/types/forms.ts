import type { AIToolId } from "@/types/pricing";

export const AUDIT_USE_CASES = [
  "coding",
  "research",
  "content",
  "support",
  "workflow",
  "api-integration",
] as const;

export type AuditUseCase = (typeof AUDIT_USE_CASES)[number];

export interface LeadCaptureFields {
  fullName?: string;
  workEmail?: string;
  companyName?: string;
}

export interface AuditToolFormEntry {
  toolId: AIToolId;
  isSelected: boolean;
  selectedPlanName: string;
  monthlySpendUsd?: number;
  seatCount?: number;
  primaryUseCase: AuditUseCase;
}

export interface AuditFormValues {
  teamSize: number;
  primaryUseCase: AuditUseCase;
  tools: AuditToolFormEntry[];
  leadCapture?: LeadCaptureFields;
  website?: string; // Honeypot field
}
