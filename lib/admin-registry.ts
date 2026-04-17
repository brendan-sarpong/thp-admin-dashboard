export type FieldType = "text" | "uuid";

export type AdminTableConfig = {
  table: string;
  label: string;
  /** Column used for ordering when present on the table */
  orderBy?: { column: string; ascending?: boolean };
  canDelete: boolean;
  canCreate: boolean;
  /** For create / edit forms */
  formFields?: Record<string, FieldType>;
  /** If true, only list rows (no mutations beyond optional delete if canDelete) */
  readOnly?: boolean;
};

/**
 * Task 7 table coverage. Column names follow common Supabase conventions; adjust
 * `formFields` if your staging schema differs (Supabase errors will name the mismatch).
 */
export const ADMIN_TABLE_REGISTRY: Record<string, AdminTableConfig> = {
  "humor-flavors": {
    table: "humor_flavors",
    label: "Humor flavors",
    orderBy: { column: "id", ascending: true },
    canDelete: false,
    canCreate: false,
    readOnly: true,
  },
  "humor-flavor-steps": {
    table: "humor_flavor_steps",
    label: "Humor flavor steps",
    orderBy: { column: "step_order", ascending: true },
    canDelete: false,
    canCreate: false,
    readOnly: true,
  },
  terms: {
    table: "terms",
    label: "Terms",
    orderBy: { column: "id", ascending: true },
    canDelete: true,
    canCreate: true,
    formFields: { term: "text" },
  },
  captions: {
    table: "captions",
    label: "Captions",
    orderBy: { column: "id", ascending: true },
    canDelete: false,
    canCreate: false,
    readOnly: true,
  },
  "caption-requests": {
    table: "caption_requests",
    label: "Caption requests",
    orderBy: { column: "id", ascending: true },
    canDelete: false,
    canCreate: false,
    readOnly: true,
  },
  "caption-examples": {
    table: "caption_examples",
    label: "Caption examples",
    orderBy: { column: "id", ascending: true },
    canDelete: true,
    canCreate: true,
    formFields: {
      text: "text",
      image_id: "uuid",
      humor_flavor_id: "uuid",
    },
  },
  "llm-providers": {
    table: "llm_providers",
    label: "LLM providers",
    orderBy: { column: "id", ascending: true },
    canDelete: true,
    canCreate: true,
    formFields: { name: "text" },
  },
  "llm-models": {
    table: "llm_models",
    label: "LLM models",
    orderBy: { column: "id", ascending: true },
    canDelete: true,
    canCreate: true,
    formFields: { name: "text", llm_provider_id: "uuid" },
  },
  "llm-prompt-chains": {
    table: "llm_prompt_chains",
    label: "LLM prompt chains",
    orderBy: { column: "id", ascending: true },
    canDelete: false,
    canCreate: false,
    readOnly: true,
  },
  "llm-responses": {
    table: "llm_responses",
    label: "LLM responses",
    orderBy: { column: "id", ascending: true },
    canDelete: false,
    canCreate: false,
    readOnly: true,
  },
  "allowed-signup-domains": {
    table: "allowed_signup_domains",
    label: "Allowed signup domains",
    orderBy: { column: "id", ascending: true },
    canDelete: true,
    canCreate: true,
    formFields: { domain: "text" },
  },
  "whitelisted-emails": {
    table: "whitelisted_email_addresses",
    label: "Whitelisted email addresses",
    orderBy: { column: "id", ascending: true },
    canDelete: true,
    canCreate: true,
    formFields: { email: "text" },
  },
};

export function getAdminTableConfig(slug: string) {
  return ADMIN_TABLE_REGISTRY[slug] ?? null;
}

export const ADMIN_TABLE_SLUGS = Object.keys(ADMIN_TABLE_REGISTRY);
