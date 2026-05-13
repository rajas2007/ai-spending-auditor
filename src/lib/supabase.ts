import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServerUrl = process.env.SUPABASE_URL ?? supabaseUrl;
const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? supabaseAnonKey;

console.log("[SUPABASE CONFIG] Environment setup:");
console.log("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "NOT SET");
console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? `SET (${supabaseAnonKey.substring(0, 10)}...)` : "NOT SET");
console.log("  SUPABASE_URL:", process.env.SUPABASE_URL ? "SET" : "NOT SET");
console.log("  SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
console.log("  SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "SET" : "NOT SET");
console.log("  Using server URL:", supabaseServerUrl ? "SET" : "NOT SET");
console.log("  Using server key (from):", 
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "SUPABASE_SERVICE_ROLE_KEY" :
  process.env.SUPABASE_ANON_KEY ? "SUPABASE_ANON_KEY" :
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
);

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseServerUrl && supabaseServerKey);
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;

  browserClient ??= createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  serverClient ??= createClient(supabaseServerUrl!, supabaseServerKey!);
  return serverClient;
}
