import Link from "next/link";
import { redirect } from "next/navigation";
import { canUseMatrixTool } from "@/lib/access";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { GoogleSignInButton } from "./google-sign-in-button";
import { LoginSignOutButton } from "./sign-out-button";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin, is_matrix_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isSuper = Boolean(profile?.is_superadmin);
    const isMatrix = Boolean(profile?.is_matrix_admin);
    const dest = params.next?.startsWith("/") ? params.next : null;

    if (isSuper) {
      redirect(dest ?? "/admin");
    }
    if (canUseMatrixTool(isSuper, isMatrix)) {
      if (dest?.startsWith("/admin")) {
        redirect("/matrix");
      }
      redirect(dest ?? "/matrix");
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with Google. Superadmins use the admin dashboard; matrix
          admins use the humor / matrix tool.
        </p>
      </div>

      {params.error === "forbidden" && (
        <div className="space-y-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p>
            Your account is not authorized for admin or matrix tools (check
            profile flags in Supabase).
          </p>
          {user ? <LoginSignOutButton /> : null}
        </div>
      )}
      {params.error === "auth" && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          Sign-in failed. Try again.
        </p>
      )}

      <GoogleSignInButton nextPath={params.next} />

      <p className="text-center text-sm text-zinc-500">
        <Link href="/" className="underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
