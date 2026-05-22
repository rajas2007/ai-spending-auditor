import type { AuditEngineInput, AuditEngineResult } from "@/lib/audit-engine";
import type { PricingSnapshot } from "@/config/pricing";

export interface StoredAudit {
  id: string;
  userId?: string;
  input: AuditEngineInput;
  result: AuditEngineResult;
  pricingVersionUsed?: string;
  pricingSnapshotUsed?: PricingSnapshot;
  createdAt: string;
}
