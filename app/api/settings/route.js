import { supabase } from "@/lib/supabaseClient";

// Public read-only settings (delivery charges, payment info, etc.) — used by
// client components like checkout that need live values without a full page reload.
export async function GET() {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ settings: data });
}
