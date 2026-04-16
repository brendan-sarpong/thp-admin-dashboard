"use client";

import { createClient } from "@/lib/supabase";

type Props = {
  nextPath?: string;
};

export function GoogleSignInButton({ nextPath }: Props) {
  async function signInWithGoogle() {
    const supabase = createClient();
    const origin = window.location.origin;
    const next = nextPath && nextPath.startsWith("/") ? nextPath : "/admin";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => void signInWithGoogle()}
      className="w-full rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      Continue with Google
    </button>
  );
}
