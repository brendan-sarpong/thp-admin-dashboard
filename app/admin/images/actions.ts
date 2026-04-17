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

export async function updateImageUrlAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) {
    redirect("/admin/images?error=" + encodeURIComponent("Image id and URL required."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("images").update({ url }).eq("id", id);
  if (error) {
    redirect("/admin/images?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin/images");
  redirect("/admin/images");
}

export async function uploadImageFileAction(formData: FormData) {
  const bucket =
    process.env.SUPABASE_IMAGE_BUCKET ??
    process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET ??
    "images";

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/images?error=" + encodeURIComponent("Choose a file to upload."));
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/images?error=" + encodeURIComponent("Not signed in."));
  }

  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    redirect(
      "/admin/images?error=" +
        encodeURIComponent(
          `${uploadError.message} (bucket: ${bucket}). Set SUPABASE_IMAGE_BUCKET if needed.`
        )
    );
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  const { error: insertError } = await supabase.from("images").insert({
    url: pub.publicUrl,
    user_id: user.id,
  });

  if (insertError) {
    redirect("/admin/images?error=" + encodeURIComponent(insertError.message));
  }

  revalidatePath("/admin/images");
  redirect("/admin/images");
}
