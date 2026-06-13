import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeStoredAudit } from "@/lib/audit-normalization";
import type { StoredAudit } from "@/types/stored-audit";

function toStoredAudit(row: Record<string, unknown>): StoredAudit {
  // If the DB returned the analytics flattened on the row rather than in a result column,
  // we fallback to using the entire row as the raw result object.
  const rawResult = row.result !== undefined && row.result !== null ? row.result : row;
  const resultObject = rawResult && typeof rawResult === "object" ? rawResult as Record<string, unknown> : {};

  const audit: StoredAudit = {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    input: row.input as StoredAudit["input"],
    result: rawResult as StoredAudit["result"],
    pricingVersionUsed: typeof row.pricing_version_used === "string"
      ? row.pricing_version_used
      : typeof resultObject.pricingVersionUsed === "string"
        ? resultObject.pricingVersionUsed
        : undefined,
    pricingSnapshotUsed: row.pricing_snapshot_used
      ? row.pricing_snapshot_used as StoredAudit["pricingSnapshotUsed"]
      : resultObject.pricingSnapshotUsed as StoredAudit["pricingSnapshotUsed"],
    createdAt: String(row.created_at),
  };
  // Normalize the result to ensure consistent structure after DB round-trip
  return normalizeStoredAudit(audit);
}

export async function getPublicAuditById(auditId: string): Promise<StoredAudit | null> {
  const supabase = getSupabaseServerClient();
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .rpc("get_public_audit_by_id", { p_audit_id: auditId })
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      return null;
    }
    
    return toStoredAudit(data as Record<string, unknown>);
  }

  return null;
}

export async function getLatestReauditForAudit(auditId: string): Promise<StoredAudit | null> {
  const supabase = getSupabaseServerClient();
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("audits")
      .select("id, user_id, input, result, pricing_version_used, pricing_snapshot_used, created_at")
      .eq("reaudit_of", auditId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      return null;
    }
    
    return toStoredAudit(data as Record<string, unknown>);
  }

  return null;
}
