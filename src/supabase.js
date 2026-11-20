import { createClient } from "@supabase/supabase-js";
const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
// Accept either the project URL or a copied REST endpoint URL.
const url = configuredUrl?.replace(/\/rest\/v1\/?$/, "");
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
