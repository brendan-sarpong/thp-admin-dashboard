import Link from "next/link";
import { createHumorFlavorAction } from "../../actions";

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function NewHumorFlavorPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New humor flavor</h1>
        <Link href="/matrix/flavors" className="text-sm underline">
          Cancel
        </Link>
      </div>
      {sp.error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {sp.error}
        </p>
      )}
      <form action={createHumorFlavorAction} className="space-y-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>Name</span>
          <input
            name="name"
            required
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Description (optional)</span>
          <textarea
            name="description"
            rows={3}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create
        </button>
      </form>
    </div>
  );
}
