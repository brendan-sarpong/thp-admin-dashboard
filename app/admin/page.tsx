import Link from "next/link";
import { ADMIN_TABLE_REGISTRY } from "@/lib/admin-registry";
import { fetchAdminStats } from "@/lib/admin-stats";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminHomePage() {
  const supabase = await createServerSupabaseClient();
  const stats = await fetchAdminStats(supabase);

  const ranked = [...stats.tables]
    .filter((t) => t.count !== null)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const max = Math.max(1, ...(ranked.map((t) => t.count ?? 0) || [1]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Operations overview</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Snapshot counts across staging tables. Bars compare relative volume
            (not time series). Use the nav for CRUD and read-only explorers.
          </p>
        </div>
        <Link
          href="/matrix"
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Humor / matrix tool →
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Superadmin profiles"
          value={stats.superadminCount}
          hint={stats.superadminError}
        />
        <StatCard
          label="Matrix admin profiles"
          value={stats.matrixAdminCount}
          hint={stats.matrixAdminError}
        />
        <StatCard
          label="Images (table)"
          value={stats.tables.find((t) => t.table === "images")?.count ?? null}
          hint={stats.tables.find((t) => t.table === "images")?.error}
        />
        <StatCard
          label="Captions (table)"
          value={stats.tables.find((t) => t.table === "captions")?.count ?? null}
          hint={stats.tables.find((t) => t.table === "captions")?.error}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Table volume</h2>
        <div className="space-y-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
          {ranked.map((row) => {
            const pct = Math.round(((row.count ?? 0) / max) * 100);
            return (
              <div key={row.table} className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-mono">{row.table}</span>
                  <span>{row.count ?? "—"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-800 dark:bg-zinc-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {row.error && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {row.error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Quick links</h2>
        <ul className="columns-1 gap-x-8 text-sm sm:columns-2">
          <li>
            <Link href="/admin/users" className="underline">
              Users
            </Link>
          </li>
          <li>
            <Link href="/admin/images" className="underline">
              Images
            </Link>
          </li>
          <li>
            <Link href="/admin/humor-mix" className="underline">
              Humor mix
            </Link>
          </li>
          {Object.entries(ADMIN_TABLE_REGISTRY).map(([slug, cfg]) => (
            <li key={slug}>
              <Link href={`/admin/tables/${slug}`} className="underline">
                {cfg.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | null;
  hint?: string | null;
}) {
  return (
    <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">
        {value === null ? "—" : value}
      </p>
      {hint && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{hint}</p>
      )}
    </div>
  );
}
