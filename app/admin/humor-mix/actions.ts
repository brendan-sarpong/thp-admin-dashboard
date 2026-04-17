"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function updateHumorMixRowAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const rawJson = String(formData.get("payload") ?? "").trim();
  if (!id || !rawJson) {
    redirect("/admin/humor-mix?error=" + encodeURIComponent("Missing id or JSON."));
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    redirect("/admin/humor-mix?error=" + encodeURIComponent("Invalid JSON."));
  }

  delete payload.id;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("humor_mix").update(payload).eq("id", id);
  if (error) {
    redirect("/admin/humor-mix?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin/humor-mix");
  redirect("/admin/humor-mix");
}
