import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { PRICING_VERSION } from "@/config/pricing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {

  console.log(`[DETECT CHANGES] Starting change detection. Current version: ${PRICING_VERSION}`);

  if (!isSupabaseConfigured()) {
    console.error("[DETECT CHANGES] Supabase is not configured.");
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.error("[DETECT CHANGES] Failed to initialize Supabase server client.");
    return NextResponse.json(
      { error: "Failed to initialize Supabase server client." },
      { status: 500 }
    );
  }

  try {
    // 1. Query audits: only need metadata columns to keep it lightweight
    const { data: audits, error: auditsError } = await supabase
      .from("audits")
      .select("id, user_id, pricing_version_used, created_at")
      .order("created_at", { ascending: false });

    if (auditsError) {
      console.error("[DETECT CHANGES] Error querying audits:", auditsError.message);
      return NextResponse.json({ error: auditsError.message }, { status: 500 });
    }

    // 2. Query profiles for mapping user_id -> email
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email");

    if (profilesError) {
      console.warn("[DETECT CHANGES] Error querying profiles (falling back):", profilesError.message);
    }

    // 3. Query leads for mapping audit_id -> email (for guest audits)
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("audit_id, email");

    if (leadsError) {
      console.warn("[DETECT CHANGES] Error querying leads (falling back):", leadsError.message);
    }

    // 4. Create lookup maps
    const profileEmailMap = new Map<string, string>();
    if (profiles) {
      for (const p of profiles) {
        if (p.id && p.email) {
          profileEmailMap.set(p.id, p.email);
        }
      }
    }

    const leadEmailMap = new Map<string, string>();
    if (leads) {
      for (const l of leads) {
        if (l.audit_id && l.email) {
          leadEmailMap.set(l.audit_id, l.email);
        }
      }
    }

    // 5. Filter audits that have outdated or missing pricing versions
    const outdatedAudits = [];
    const totalAuditsChecked = audits?.length ?? 0;

    if (audits) {
      for (const audit of audits) {
        const version = audit.pricing_version_used;
        // Outdated if version is null, undefined, or doesn't match PRICING_VERSION
        if (!version || version !== PRICING_VERSION) {
          let email: string | null = null;
          if (audit.user_id) {
            email = profileEmailMap.get(audit.user_id) || null;
          }
          if (!email && audit.id) {
            email = leadEmailMap.get(audit.id) || null;
          }

          outdatedAudits.push({
            auditId: audit.id,
            userId: audit.user_id || null,
            email,
            pricingVersionUsed: version || null,
            createdAt: audit.created_at,
          });
        }
      }
    }

    console.log(
      `[DETECT CHANGES] Completed: checked ${totalAuditsChecked} audits. Found ${outdatedAudits.length} outdated audits.`
    );

    return NextResponse.json({
      currentPricingVersion: PRICING_VERSION,
      totalAuditsChecked,
      outdatedAuditsCount: outdatedAudits.length,
      outdatedAudits,
    });
  } catch (error) {
    console.error("[DETECT CHANGES] Unhandled error during change detection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
