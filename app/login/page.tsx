import Link from "next/link";
import { redirect } from "next/navigation";
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
      .select("is_superadmin")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.is_superadmin) {
      redirect(params.next ?? "/admin");
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in with Google. Only superadmin profiles can access the
          dashboard.
        </p>
      </div>

      {params.error === "forbidden" && (
        <div className="space-y-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p>Your account is not authorized as a superadmin.</p>
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
