import type { SupabaseClient } from "@supabase/supabase-js";

const COUNT_TABLES = [
  "profiles",
  "images",
  "captions",
  "humor_flavors",
  "humor_flavor_steps",
  "humor_mix",
  "terms",
  "caption_requests",
  "caption_examples",
  "llm_models",
  "llm_providers",
  "llm_prompt_chains",
  "llm_responses",
  "allowed_signup_domains",
  "whitelisted_email_addresses",
] as const;

export async function fetchAdminStats(supabase: SupabaseClient) {
  const results = await Promise.all(
    COUNT_TABLES.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return {
        table,
        count: error ? null : count ?? 0,
        error: error?.message ?? null,
      };
    })
  );

  const superAdmins = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_superadmin", true);

  const matrixAdmins = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_matrix_admin", true);

  return {
    tables: results,
    superadminCount: superAdmins.count ?? null,
    superadminError: superAdmins.error?.message ?? null,
    matrixAdminCount: matrixAdmins.count ?? null,
    matrixAdminError: matrixAdmins.error?.message ?? null,
  };
}
