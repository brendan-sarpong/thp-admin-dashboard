"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function MatrixThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);
  if (!mounted) {
    return (
      <span className="inline-block h-8 w-24 rounded border border-zinc-300 dark:border-zinc-600" />
    );
  }
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500">Theme</span>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
