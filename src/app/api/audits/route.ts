import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createRequestSupabaseClient(accessToken: string | null) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() || null;
    const supabase = createRequestSupabaseClient(accessToken);

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 500 },
      );
    }

    let userId: string | null = null;
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return NextResponse.json(
          { error: "Invalid authenticated session." },
          { status: 401 },
        );
      }

      userId = data.user?.id ?? null;
    }

    const { input, result } = body;
    if (!input || !result) {
      return NextResponse.json(
        { error: "Audit input and result are required." },
        { status: 400 },
      );
    }

    const auditId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const insertPayload = {
      id: auditId,
      user_id: userId,
      input,
      result,
      created_at: createdAt,
    };

    const { error } = await supabase
      .from("audits")
      .insert(insertPayload);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ audit: insertPayload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 },
    );
  }
}
