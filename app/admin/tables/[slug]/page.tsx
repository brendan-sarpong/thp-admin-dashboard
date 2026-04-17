import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTableConfig } from "@/lib/admin-registry";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  adminCreateRowAction,
  adminDeleteRowAction,
} from "./actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminTablePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cfg = getAdminTableConfig(slug);
  if (!cfg) {
    notFound();
  }

  const sp = searchParams ? await searchParams : {};
  const supabase = await createServerSupabaseClient();
  let query = supabase.from(cfg.table).select("*").limit(300);
  if (cfg.orderBy) {
    query = query.order(cfg.orderBy.column, {
      ascending: cfg.orderBy.ascending ?? false,
    });
  }
  const { data: rows, error } = await query;

  const columns =
    rows && rows.length > 0
      ? Object.keys(rows[0] as object)
      : (["id"] as string[]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{cfg.label}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Table: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{cfg.table}</code>
          </p>
        </div>
        <Link href="/admin" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>

      {sp.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {sp.error}
        </p>
      )}

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {error.message}
        </p>
      )}

      {cfg.canCreate && cfg.formFields && (
        <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-2 text-lg font-medium">Create row</h2>
          <form action={adminCreateRowAction} className="flex flex-col gap-3">
            <input type="hidden" name="slug" value={slug} />
            {Object.entries(cfg.formFields).map(([name, kind]) => (
              <label key={name} className="flex flex-col gap-1 text-sm">
                <span>
                  {name}
                  {kind === "uuid" ? " (optional UUID)" : ""}
                </span>
                <input
                  name={name}
                  type={kind === "uuid" ? "text" : "text"}
                  required={kind === "text"}
                  className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
                />
              </label>
            ))}
            <button
              type="submit"
              className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Create
            </button>
          </form>
        </section>
      )}

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 font-medium">
                  {c}
                </th>
              ))}
              <th className="px-3 py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => {
              const r = row as Record<string, unknown>;
              const id = String(r.id ?? "");
              return (
                <tr
                  key={id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  {columns.map((c) => (
                    <td key={c} className="max-w-[220px] truncate px-3 py-2 font-mono text-xs">
                      {formatCell(r[c])}
                    </td>
                  ))}
                  <td className="space-y-1 px-3 py-2 align-top">
                    {!cfg.readOnly && cfg.formFields && (
                      <Link
                        href={`/admin/tables/${slug}/${id}`}
                        className="block text-xs underline"
                      >
                        Edit
                      </Link>
                    )}
                    {cfg.canDelete && (
                      <form action={adminDeleteRowAction}>
                        <input type="hidden" name="slug" value={slug} />
                        <input type="hidden" name="id" value={id} />
                        <button
                          type="submit"
                          className="text-xs text-red-700 underline dark:text-red-300"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {!error && (rows ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-4 text-zinc-500"
                >
                  No rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
