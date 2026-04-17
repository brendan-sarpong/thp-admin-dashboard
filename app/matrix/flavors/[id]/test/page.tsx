import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { testHumorFlavorPipelineAction } from "../../../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function MatrixFlavorTestPage({ params, searchParams }: Props) {
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

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Test pipeline</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{flavor.name}</p>
        </div>
        <Link href={`/matrix/flavors/${id}`} className="text-sm underline">
          Back
        </Link>
      </div>
      <p className="text-xs text-zinc-500">
        Uses your Supabase session JWT against{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">api.almostcrackd.ai</code>{" "}
        (presign → upload → register → generate with humor flavor id).
      </p>
      {sp.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {sp.error}
        </p>
      )}
      <form
        action={testHumorFlavorPipelineAction}
        encType="multipart/form-data"
        className="space-y-3 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input type="hidden" name="humorFlavorId" value={id} />
        <label className="flex flex-col gap-1 text-sm">
          <span>Image file</span>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
          />
        </label>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Run pipeline
        </button>
      </form>
    </div>
  );
}
