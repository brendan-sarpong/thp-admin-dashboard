import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateHumorMixRowAction } from "./actions";

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function HumorMixPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const supabase = await createServerSupabaseClient();
  const { data: rows, error } = await supabase
    .from("humor_mix")
    .select("*")
    .order("id", { ascending: true })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Humor mix</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Read / update rows in <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">humor_mix</code>.
            Edit JSON carefully — it replaces mutable columns on save (excluding{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">id</code>).
          </p>
        </div>
        <Link href="/admin" className="text-sm underline">
          Dashboard
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

      <div className="space-y-6">
        {(rows ?? []).map((row) => {
          const r = row as Record<string, unknown>;
          const id = String(r.id ?? "");
          const rest = { ...r };
          delete rest.id;
          const initial = JSON.stringify(rest, null, 2);
          return (
            <section
              key={id}
              className="rounded border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <h2 className="mb-2 font-mono text-sm text-zinc-500">id: {id}</h2>
              <form action={updateHumorMixRowAction} className="space-y-2">
                <input type="hidden" name="id" value={id} />
                <textarea
                  name="payload"
                  rows={10}
                  defaultValue={initial}
                  className="w-full rounded border border-zinc-300 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
                />
                <button
                  type="submit"
                  className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save row
                </button>
              </form>
            </section>
          );
        })}
        {!error && (rows ?? []).length === 0 && (
          <p className="text-sm text-zinc-500">No humor_mix rows.</p>
        )}
      </div>
    </div>
  );
}
