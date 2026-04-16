import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminCaptionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, text, image_id")
    .order("id", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Captions</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Read-only list.</p>

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
              <th className="px-3 py-2 font-medium">text</th>
              <th className="px-3 py-2 font-medium">image_id</th>
            </tr>
          </thead>
          <tbody>
            {(captions ?? []).map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                <td className="px-3 py-2">{row.text}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.image_id}</td>
              </tr>
            ))}
            {!error && (captions ?? []).length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-zinc-500">
                  No captions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
