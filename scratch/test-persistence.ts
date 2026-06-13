process.env.NEXT_PUBLIC_SUPABASE_URL = "https://wbulnnxdkagfylgjefka.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_p0BylQ46BRXHR4bebWZ95g_abAOG1Ix";

async function main() {
  console.log("Starting persistence verification...");

  const { POST } = await import("../src/app/api/audits/route");
  const { runAuditEngine } = await import("../src/lib/audit-engine");
  const { createClient } = await import("@supabase/supabase-js");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });

  const testEmail = `test-${Date.now()}@gmail.com`;
  console.log(`Signing up test user: ${testEmail}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: "Password123!",
  });

  if (signUpError) {
    console.error("Auth signUp error:", signUpError.message);
    process.exit(1);
  }

  const userId = signUpData.user?.id;
  const accessToken = signUpData.session?.access_token;
  console.log("Signed up successfully. User ID:", userId);

  const input = {
    teamSize: 3,
    primaryUseCase: "coding" as const,
    tools: [
      { toolId: "cursor" as const, selectedPlanName: "Pro", seats: 3, primaryUseCase: "coding" as const },
    ],
  };

  const result = runAuditEngine(input);
  console.log("Generated audit engine result. pricingVersionUsed:", result.pricingVersionUsed);

  // Call the POST api handler with the authenticated user's access token
  const requestBody = {
    input,
    result,
  };

  const req = new Request("http://localhost/api/audits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  const response = await POST(req);
  console.log("API response status:", response.status);
  
  const data = await response.json();
  if (data.error) {
    console.error("API returned error:", data.error);
    process.exit(1);
  }

  const savedAudit = data.audit;
  if (!savedAudit) {
    console.error("FAIL: API response does not contain saved audit!");
    process.exit(1);
  }
  console.log("API returned saved audit ID:", savedAudit.id);

  // Direct select using authenticated client session
  const { data: dbData, error: dbError } = await supabase
    .from("audits")
    .select("id, pricing_version_used, pricing_snapshot_used")
    .eq("id", savedAudit.id)
    .single();

  if (dbError) {
    console.error("Supabase insert/select error:", dbError.message);
    process.exit(1);
  }

  if (!dbData) {
    console.error("FAIL: No data returned from insert!");
    process.exit(1);
  }

  console.log("Direct insert result:");
  console.log("DB pricing_version_used:", dbData.pricing_version_used);
  console.log("DB pricing_snapshot_used version:", dbData.pricing_snapshot_used?.version);

  if (dbData.pricing_version_used === "2026-05-20" && dbData.pricing_snapshot_used?.version === "2026-05-20") {
    console.log("SUCCESS: Both values are verified in the database!");
  } else {
    console.error("FAIL: Database row contains null/incorrect pricing metadata!");
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
