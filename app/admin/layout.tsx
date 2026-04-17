import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_TABLE_REGISTRY } from "@/lib/admin-registry";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SignOutButton } from "./sign-out-button";

const CORE_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions (legacy)" },
  { href: "/admin/humor-mix", label: "Humor mix" },
  { href: "/matrix", label: "Matrix tool" },
] as const;

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
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold">THP Admin</span>
            <SignOutButton />
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {CORE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <details className="text-sm">
            <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
              All registry tables
            </summary>
            <div className="mt-2 flex max-h-40 flex-wrap gap-x-4 gap-y-1 overflow-y-auto text-xs">
              {Object.entries(ADMIN_TABLE_REGISTRY).map(([slug, cfg]) => (
                <Link key={slug} href={`/admin/tables/${slug}`} className="underline">
                  {cfg.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
