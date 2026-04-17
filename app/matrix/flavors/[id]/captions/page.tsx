import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ generated?: string }>;
};

export default async function MatrixFlavorCaptionsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const supabase = await createServerSupabaseClient();

  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!flavor) {
    notFound();
  }

  let rows: Record<string, unknown>[] | null = null;
  let error: { message: string } | null = null;
  let usedFilter = true;

  const filtered = await supabase
    .from("captions")
    .select("*")
    .eq("humor_flavor_id", id)
    .limit(400);

  if (filtered.error) {
    usedFilter = false;
    const all = await supabase.from("captions").select("*").limit(200);
    rows = (all.data as Record<string, unknown>[]) ?? null;
    error = all.error;
  } else {
    rows = (filtered.data as Record<string, unknown>[]) ?? null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Captions</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{flavor.name}</p>
        </div>
        <Link href={`/matrix/flavors/${id}`} className="text-sm underline">
          Back
        </Link>
      </div>

      {sp.generated && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Pipeline finished — refreshed caption list.
          {!usedFilter && (
            <>
              {" "}
              (Could not filter by{" "}
              <code className="rounded bg-white/60 px-1 dark:bg-black/30">humor_flavor_id</code>{" "}
              — showing recent captions instead.)
            </>
          )}
        </p>
      )}

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-2 py-2 font-medium">id</th>
              <th className="px-2 py-2 font-medium">text</th>
              <th className="px-2 py-2 font-medium">image_id</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => {
              const r = row;
              return (
                <tr key={String(r.id)} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-2 py-2 font-mono">{String(r.id)}</td>
                  <td className="max-w-md px-2 py-2">{String(r.text ?? r.body ?? "")}</td>
                  <td className="px-2 py-2 font-mono">{String(r.image_id ?? "")}</td>
                </tr>
              );
            })}
            {!error && (rows ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-4 text-zinc-500">
                  No captions found for this flavor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
