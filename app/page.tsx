import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function Home() {
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
      redirect("/admin");
    }
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">THP Admin Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sign in with a superadmin Google account to manage users, images, and
        view captions.
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
