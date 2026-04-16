import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Choose a section from the navigation above.
      </p>
      <ul className="list-inside list-disc text-sm">
        <li>
          <Link href="/admin/users" className="underline">
            Users
          </Link>{" "}
          — browse profiles
        </li>
        <li>
          <Link href="/admin/images" className="underline">
            Images
          </Link>{" "}
          — list, add by URL, delete
        </li>
        <li>
          <Link href="/admin/captions" className="underline">
            Captions
          </Link>{" "}
          — read-only list
        </li>
      </ul>
    </div>
  );
}
