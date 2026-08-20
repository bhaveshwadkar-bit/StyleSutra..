import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("promo_messages").select("*").order("sort_order");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ messages: data });
}

export async function POST(request) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  if (!body.text?.trim()) return Response.json({ error: "Message text is required" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("promo_messages").insert({
    text: body.text.trim(),
    sort_order: body.sort_order ?? 99
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ message: data });
}
