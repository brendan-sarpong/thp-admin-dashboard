import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SignOutButton } from "./sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_superadmin) {
    redirect("/login?error=forbidden");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/admin" className="font-semibold">
              Admin
            </Link>
            <Link href="/admin/users" className="underline">
              Users
            </Link>
            <Link href="/admin/images" className="underline">
              Images
            </Link>
            <Link href="/admin/captions" className="underline">
              Captions
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
