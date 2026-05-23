import { NextResponse } from "next/server";
import { runAuditEngine } from "@/lib/audit-engine";
import { PRICING_VERSION, getPricingSnapshot } from "@/config/pricing";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ auditId: string }> }) {
  try {
    const { auditId } = await params;
    const accessToken = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim() || null;
    // Server client for auth
    const supabase = getSupabaseServerClient();
    console.log("[REAUDIT] Starting re-audit for ID", auditId);
    if (!supabase) {
      console.error("[REAUDIT] Supabase not configured");
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
    }
    // Determine user context (authenticated vs guest)
    let userId: string | null = null;
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("[REAUDIT] Auth error", error);
        return NextResponse.json({ error: "Invalid authenticated session." }, { status: 401 });
      }
      userId = data.user?.id ?? null;
    }
    // Admin client for DB ops
    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      console.error("[REAUDIT] Admin client not configured");
      return NextResponse.json({ error: "Supabase not configured for admin ops." }, { status: 500 });
    }

    const { data: originalAudit, error: fetchError } = await supabaseAdmin
      .from("audits")
      .select("input,result")
      .eq("id", auditId)
      .single();
    if (fetchError || !originalAudit) {
      console.error("[REAUDIT] Fetch error", fetchError);
      return NextResponse.json({ error: fetchError?.message ?? "Original audit not found." }, { status: 404 });
    }

    const { input } = originalAudit;

    const newResult = runAuditEngine(input);

    const newAuditId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const insertPayload = {
      id: newAuditId,
      user_id: userId,
      input,
      result: newResult,
      pricing_version_used: PRICING_VERSION,
      pricing_snapshot_used: getPricingSnapshot(),
      reaudit_of: auditId,
      created_at: createdAt,
    };

    const { error: insertError } = await supabaseAdmin.from("audits").insert(insertPayload);
    if (insertError) {
      console.error("[REAUDIT] Insert error", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    console.log("[REAUDIT] Created new audit", newAuditId);
    return NextResponse.json({ newAuditId, status: "created" });
  } catch (err) {
    console.error("[REAUDIT ERROR]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
