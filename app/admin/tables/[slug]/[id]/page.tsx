import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTableConfig } from "@/lib/admin-registry";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { adminUpdateRowAction } from "../actions";

type Props = { params: Promise<{ slug: string; id: string }> };

export default async function AdminTableEditPage({ params }: Props) {
  const { slug, id } = await params;
  const cfg = getAdminTableConfig(slug);
  if (!cfg || cfg.readOnly || !cfg.formFields) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from(cfg.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const r = row as Record<string, string>;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          Edit {cfg.label}
        </h1>
        <Link href={`/admin/tables/${slug}`} className="text-sm underline">
          Cancel
        </Link>
      </div>
      <form action={adminUpdateRowAction} className="flex flex-col gap-3">
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="id" value={id} />
        {Object.entries(cfg.formFields).map(([name, kind]) => (
          <label key={name} className="flex flex-col gap-1 text-sm">
            <span>{name}</span>
            <input
              name={name}
              defaultValue={r[name] ?? ""}
              type="text"
              required={kind === "text"}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
        ))}
        <button
          type="submit"
          className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save
        </button>
      </form>
    </div>
  );
}
