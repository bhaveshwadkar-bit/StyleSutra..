// Server-only Supabase client using the SERVICE ROLE key.
// NEVER import this file from a "use client" component — it bypasses RLS
// and must only run inside API routes / server components.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});
