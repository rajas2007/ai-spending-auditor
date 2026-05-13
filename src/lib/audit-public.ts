import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { normalizeStoredAudit } from "@/lib/audit-normalization";
import type { StoredAudit } from "@/types/stored-audit";

function toStoredAudit(row: Record<string, unknown>): StoredAudit {
  // If the DB returned the analytics flattened on the row rather than in a result column,
  // we fallback to using the entire row as the raw result object.
  const rawResult = row.result !== undefined && row.result !== null ? row.result : row;

  const audit: StoredAudit = {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    input: row.input as StoredAudit["input"],
    result: rawResult as StoredAudit["result"],
    createdAt: String(row.created_at),
  };
  // Normalize the result to ensure consistent structure after DB round-trip
  return normalizeStoredAudit(audit);
}

export async function getPublicAuditById(auditId: string): Promise<StoredAudit | null> {
  console.log("[AUDIT PUBLIC] getPublicAuditById called with auditId:", auditId);
  
  const supabase = getSupabaseServerClient();
  console.log("[AUDIT PUBLIC] Supabase client exists:", Boolean(supabase));
  console.log("[AUDIT PUBLIC] Supabase configured:", isSupabaseConfigured());

  if (supabase && isSupabaseConfigured()) {
    console.log("[AUDIT PUBLIC] Executing Supabase query for audit id:", auditId);
    const { data, error } = await supabase
      .rpc("get_public_audit_by_id", { p_audit_id: auditId })
      .maybeSingle();

    console.log("[AUDIT PUBLIC] Supabase query error:", error?.message || "none");
    console.log("[AUDIT PUBLIC] Supabase query data:", data ? { id: data.id, user_id: data.user_id, hasResult: Boolean(data.result), hasInput: Boolean(data.input) } : null);

    if (error) {
      console.error("[AUDIT PUBLIC] Query error details:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
      console.log("[AUDIT PUBLIC] No data returned from query");
      return null;
    }
    
    console.log("[AUDIT PUBLIC] Converting to StoredAudit and normalizing");
    const result = toStoredAudit(data);
    console.log("[AUDIT PUBLIC] Normalization complete, returning audit");
    return result;
  }

  console.warn("[AUDIT PUBLIC] Supabase not configured, returning null");
  return null;
}
