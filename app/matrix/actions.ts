"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  pipelineGenerateCaptions,
  pipelineGeneratePresignedUrl,
  pipelineRegisterImage,
  pipelineUploadBytes,
} from "@/lib/pipeline";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function refreshFlavor(id: string) {
  revalidatePath("/matrix/flavors");
  revalidatePath(`/matrix/flavors/${id}`);
  revalidatePath(`/matrix/flavors/${id}/captions`);
  revalidatePath(`/matrix/flavors/${id}/test`);
}

export async function createHumorFlavorAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) {
    redirect("/matrix/flavors/new?error=" + encodeURIComponent("Name is required."));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("humor_flavors")
    .insert({ name, description: description || null })
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect(
      "/matrix/flavors/new?error=" + encodeURIComponent(error?.message ?? "Insert failed.")
    );
  }

  refreshFlavor(String(data.id));
  redirect(`/matrix/flavors/${data.id}`);
}

export async function updateHumorFlavorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!id || !name) {
    redirect("/matrix/flavors?error=" + encodeURIComponent("Missing fields."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("humor_flavors")
    .update({ name, description: description || null })
    .eq("id", id);

  if (error) {
    redirect(`/matrix/flavors/${id}?error=` + encodeURIComponent(error.message));
  }

  refreshFlavor(id);
  redirect(`/matrix/flavors/${id}`);
}

export async function deleteHumorFlavorAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect("/matrix/flavors?error=" + encodeURIComponent("Missing id."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("humor_flavors").delete().eq("id", id);
  if (error) {
    redirect(`/matrix/flavors/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/matrix/flavors");
  redirect("/matrix/flavors");
}

export async function createHumorFlavorStepAction(formData: FormData) {
  const humor_flavor_id = String(formData.get("humor_flavor_id") ?? "").trim();
  const step_order = Number(formData.get("step_order") ?? NaN);
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!humor_flavor_id || !Number.isFinite(step_order) || !prompt) {
    redirect(
      `/matrix/flavors/${humor_flavor_id}?error=` +
        encodeURIComponent("Step order and prompt are required.")
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("humor_flavor_steps").insert({
    humor_flavor_id,
    step_order,
    prompt,
  });

  if (error) {
    redirect(
      `/matrix/flavors/${humor_flavor_id}?error=` + encodeURIComponent(error.message)
    );
  }

  refreshFlavor(humor_flavor_id);
  redirect(`/matrix/flavors/${humor_flavor_id}`);
}

export async function updateHumorFlavorStepAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const humor_flavor_id = String(formData.get("humor_flavor_id") ?? "").trim();
  const step_order = Number(formData.get("step_order") ?? NaN);
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!id || !humor_flavor_id || !Number.isFinite(step_order) || !prompt) {
    redirect("/matrix/flavors?error=" + encodeURIComponent("Missing step fields."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("humor_flavor_steps")
    .update({ step_order, prompt })
    .eq("id", id);

  if (error) {
    redirect(
      `/matrix/flavors/${humor_flavor_id}?error=` + encodeURIComponent(error.message)
    );
  }

  refreshFlavor(humor_flavor_id);
  redirect(`/matrix/flavors/${humor_flavor_id}`);
}

export async function deleteHumorFlavorStepAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const humor_flavor_id = String(formData.get("humor_flavor_id") ?? "").trim();
  if (!id || !humor_flavor_id) {
    redirect("/matrix/flavors?error=" + encodeURIComponent("Missing ids."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("humor_flavor_steps").delete().eq("id", id);
  if (error) {
    redirect(
      `/matrix/flavors/${humor_flavor_id}?error=` + encodeURIComponent(error.message)
    );
  }

  refreshFlavor(humor_flavor_id);
  redirect(`/matrix/flavors/${humor_flavor_id}`);
}

export async function moveHumorFlavorStepAction(formData: FormData) {
  const humor_flavor_id = String(formData.get("humor_flavor_id") ?? "").trim();
  const step_id = String(formData.get("step_id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "");
  if (!humor_flavor_id || !step_id || (direction !== "up" && direction !== "down")) {
    redirect(`/matrix/flavors/${humor_flavor_id}?error=` + encodeURIComponent("Bad reorder."));
  }

  const supabase = await createServerSupabaseClient();
  const { data: steps, error } = await supabase
    .from("humor_flavor_steps")
    .select("id, step_order")
    .eq("humor_flavor_id", humor_flavor_id)
    .order("step_order", { ascending: true });

  if (error || !steps?.length) {
    redirect(
      `/matrix/flavors/${humor_flavor_id}?error=` +
        encodeURIComponent(error?.message ?? "No steps.")
    );
  }

  const idx = steps.findIndex((s) => s.id === step_id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= steps.length) {
    redirect(`/matrix/flavors/${humor_flavor_id}`);
  }

  const a = steps[idx];
  const b = steps[swapIdx];
  const orderA = a.step_order as number;
  const orderB = b.step_order as number;

  const { error: e1 } = await supabase
    .from("humor_flavor_steps")
    .update({ step_order: orderB })
    .eq("id", a.id);
  const { error: e2 } = await supabase
    .from("humor_flavor_steps")
    .update({ step_order: orderA })
    .eq("id", b.id);

  if (e1 || e2) {
    redirect(
      `/matrix/flavors/${humor_flavor_id}?error=` +
        encodeURIComponent(e1?.message ?? e2?.message ?? "Reorder failed.")
    );
  }

  refreshFlavor(humor_flavor_id);
  redirect(`/matrix/flavors/${humor_flavor_id}`);
}

export async function testHumorFlavorPipelineAction(formData: FormData) {
  const humorFlavorId = String(formData.get("humorFlavorId") ?? "").trim();
  const file = formData.get("file");
  if (!humorFlavorId || !(file instanceof File) || file.size === 0) {
    redirect(
      `/matrix/flavors/${humorFlavorId}/test?error=` +
        encodeURIComponent("Image and flavor are required.")
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    redirect("/login?error=" + encodeURIComponent("No session token."));
  }

  const contentType = file.type || "image/jpeg";

  try {
    const presigned = await pipelineGeneratePresignedUrl(token, contentType);
    await pipelineUploadBytes(presigned.presignedUrl, file, contentType);
    const registered = await pipelineRegisterImage(token, presigned.cdnUrl, false);
    await pipelineGenerateCaptions(token, registered.imageId, humorFlavorId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Pipeline failed.";
    redirect(`/matrix/flavors/${humorFlavorId}/test?error=` + encodeURIComponent(msg));
  }

  refreshFlavor(humorFlavorId);
  redirect(`/matrix/flavors/${humorFlavorId}/captions?generated=1`);
}
