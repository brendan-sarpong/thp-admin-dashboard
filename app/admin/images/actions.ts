"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function createImageAction(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) {
    redirect("/admin/images?error=" + encodeURIComponent("URL is required."));
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/images?error=" + encodeURIComponent("Not signed in."));
  }

  const { error } = await supabase.from("images").insert({
    url,
    user_id: user.id,
  });

  if (error) {
    redirect("/admin/images?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin/images");
  redirect("/admin/images");
}

export async function deleteImageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/admin/images?error=" + encodeURIComponent("Missing id."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    redirect("/admin/images?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin/images");
  redirect("/admin/images");
}
