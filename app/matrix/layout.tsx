import Link from "next/link";
import { redirect } from "next/navigation";
import { canUseMatrixTool, getSessionProfile } from "@/lib/access";
import { SignOutButton } from "@/app/admin/sign-out-button";
import { MatrixThemeToggle } from "./theme-toggle";

export default async function MatrixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isSuperAdmin, isMatrixAdmin } = await getSessionProfile();
  if (!user) {
    redirect("/login?next=/matrix");
  }
  if (!canUseMatrixTool(isSuperAdmin, isMatrixAdmin)) {
    redirect("/login?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-semibold">Humor / matrix</span>
            <Link href="/matrix" className="underline">
              Home
            </Link>
            <Link href="/matrix/flavors" className="underline">
              Flavors
            </Link>
            {isSuperAdmin && (
              <Link href="/admin" className="underline">
                Admin area
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <MatrixThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
