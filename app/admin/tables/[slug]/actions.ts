"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminTableConfig } from "@/lib/admin-registry";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function redirectWithError(slug: string, message: string): never {
  redirect(`/admin/tables/${slug}?error=${encodeURIComponent(message)}`);
}

export async function adminDeleteRowAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const cfg = getAdminTableConfig(slug);
  if (!cfg || !cfg.canDelete) {
    redirectWithError(slug || "terms", "Delete not allowed.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from(cfg.table).delete().eq("id", id);
  if (error) {
    redirectWithError(slug, error.message);
  }
  revalidatePath(`/admin/tables/${slug}`);
  redirect(`/admin/tables/${slug}`);
}

export async function adminCreateRowAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const cfg = getAdminTableConfig(slug);
  if (!cfg || !cfg.canCreate) {
    redirectWithError(slug || "terms", "Create not allowed.");
  }
  const formFields = cfg.formFields;
  if (!formFields) {
    redirectWithError(slug, "This table is not configured for creates.");
  }

  const payload: Record<string, string> = {};
  for (const key of Object.keys(formFields)) {
    const raw = String(formData.get(key) ?? "").trim();
    if (formFields[key] === "uuid" && raw === "") {
      continue;
    }
    payload[key] = raw;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from(cfg.table).insert(payload);
  if (error) {
    redirectWithError(slug, error.message);
  }
  revalidatePath(`/admin/tables/${slug}`);
  redirect(`/admin/tables/${slug}`);
}

export async function adminUpdateRowAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const cfg = getAdminTableConfig(slug);
  if (!cfg || cfg.readOnly) {
    redirectWithError(slug || "terms", "Update not allowed.");
  }
  const formFields = cfg.formFields;
  if (!formFields) {
    redirectWithError(slug, "This table is not configured for edits.");
  }

  const payload: Record<string, string> = {};
  for (const key of Object.keys(formFields)) {
    const raw = String(formData.get(key) ?? "").trim();
    if (formFields[key] === "uuid" && raw === "") {
      continue;
    }
    payload[key] = raw;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from(cfg.table).update(payload).eq("id", id);
  if (error) {
    redirectWithError(slug, error.message);
  }
  revalidatePath(`/admin/tables/${slug}`);
  revalidatePath(`/admin/tables/${slug}/${id}`);
  redirect(`/admin/tables/${slug}`);
}
