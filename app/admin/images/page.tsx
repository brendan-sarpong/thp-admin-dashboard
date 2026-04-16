import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createImageAction, deleteImageAction } from "./actions";

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function AdminImagesPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createServerSupabaseClient();
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, user_id")
    .order("id", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Images</h1>

      {params.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {params.error}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Add image</h2>
        <form action={createImageAction} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>URL</span>
            <input
              name="url"
              type="url"
              required
              placeholder="https://..."
              className="min-w-[240px] rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Create
          </button>
        </form>
      </section>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-3 py-2 font-medium">id</th>
              <th className="px-3 py-2 font-medium">url</th>
              <th className="px-3 py-2 font-medium">user_id</th>
              <th className="px-3 py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {(images ?? []).map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                <td className="max-w-xs truncate px-3 py-2">
                  <a href={row.url} className="text-blue-600 underline dark:text-blue-400" target="_blank" rel="noreferrer">
                    {row.url}
                  </a>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{row.user_id}</td>
                <td className="px-3 py-2">
                  <form action={deleteImageAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-800 dark:border-red-800 dark:text-red-200"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!error && (images ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-zinc-500">
                  No images found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
