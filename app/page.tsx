import Link from "next/link";
import { redirect } from "next/navigation";
import { canUseMatrixTool } from "@/lib/access";
import { getSupabasePublicEnv } from "@/lib/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type Props = {
  searchParams?: Promise<{ missing_env?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const env = getSupabasePublicEnv();

  if (!env.ok) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-6 px-4">
        <h1 className="text-2xl font-semibold">THP Admin Dashboard</h1>
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          Supabase environment variables are not set on this host. In Vercel,
          open your project → Settings → Environment Variables and add{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> for
          Production (and Preview if you use it), then trigger a new deployment.
        </p>
      </div>
    );
  }

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

    if (profile?.is_superadmin) {
      redirect("/admin");
    }
    if (canUseMatrixTool(false, Boolean(profile?.is_matrix_admin))) {
      redirect("/matrix");
    }
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">THP Admin Dashboard</h1>
      {sp.missing_env === "1" && (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          Admin routes are disabled until Supabase URL and anon key are set on
          Vercel (see message on a fresh deploy of the home page if env is empty).
        </p>
      )}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sign in with a Google account that has superadmin or matrix admin access
        in <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">profiles</code>.
      </p>
      <Link
        href="/login"
        className="inline-flex w-fit rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Go to login
      </Link>
    </div>
  );
}
