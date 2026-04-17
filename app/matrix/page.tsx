import Link from "next/link";

export default function MatrixHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Humor flavor workspace</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Build ordered prompt steps, reorder them, run the staging caption pipeline
        against test images, and review captions scoped to a flavor.
      </p>
      <Link
        href="/matrix/flavors"
        className="inline-flex rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Manage flavors
      </Link>
    </div>
  );
}
