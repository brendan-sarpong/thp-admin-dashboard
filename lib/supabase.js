import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./supabase-env";

/**
 * Browser / client-component Supabase client (uses cookies via @supabase/ssr).
 * @returns {import("@supabase/supabase-js").SupabaseClient}
 */
export function createClient() {
  const { ok, url, anonKey } = getSupabasePublicEnv();
  if (!ok) {
    throw new Error(
      "Supabase URL/key are not configured (set NEXT_PUBLIC_SUPABASE_* on Vercel)."
    );
  }
  return createBrowserClient(url, anonKey);
}
