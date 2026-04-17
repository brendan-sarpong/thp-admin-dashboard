import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteHumorFlavorAction } from "../actions";

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function MatrixFlavorsPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const supabase = await createServerSupabaseClient();
  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("id, name, description")
    .order("id", { ascending: true })
    .limit(200);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Humor flavors</h1>
        <Link
          href="/matrix/flavors/new"
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New flavor
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

      <div className="overflow-x-auto rounded border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {(flavors ?? []).map((f) => (
              <tr key={f.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-2">
                  <Link href={`/matrix/flavors/${f.id}`} className="font-medium underline">
                    {f.name}
                  </Link>
                  <div className="font-mono text-xs text-zinc-500">{f.id}</div>
                </td>
                <td className="max-w-md px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                  {f.description ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <form action={deleteHumorFlavorAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-700 underline dark:text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!error && (flavors ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-zinc-500">
                  No flavors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
