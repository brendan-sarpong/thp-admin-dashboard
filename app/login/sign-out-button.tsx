"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function LoginSignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="text-sm text-zinc-600 underline dark:text-zinc-400"
    >
      Sign out and use a different account
    </button>
  );
}
