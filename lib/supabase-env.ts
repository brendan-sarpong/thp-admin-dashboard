/** Trimmed Supabase URL/key for browser and server. */
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const ok = Boolean(url && anonKey);
  return { ok, url, anonKey };
}
