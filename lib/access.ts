import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function getSessionProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null as null,
      isSuperAdmin: false,
      isMatrixAdmin: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    isSuperAdmin: Boolean(profile?.is_superadmin),
    isMatrixAdmin: Boolean(profile?.is_matrix_admin),
  };
}

export function canUseAdminArea(isSuperAdmin: boolean) {
  return isSuperAdmin;
}

export function canUseMatrixTool(isSuperAdmin: boolean, isMatrixAdmin: boolean) {
  return isSuperAdmin || isMatrixAdmin;
}
