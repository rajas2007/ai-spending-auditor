import type { AuditEngineInput, AuditEngineResult } from "@/lib/audit-engine";

export interface StoredAudit {
  id: string;
  userId?: string;
  input: AuditEngineInput;
  result: AuditEngineResult;
  createdAt: string;
}
