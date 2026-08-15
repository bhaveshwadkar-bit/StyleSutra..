import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("menu_links").select("*").order("sort_order");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ links: data });
}

export async function POST(request) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  if (!body.label?.trim() || !body.url?.trim()) {
    return Response.json({ error: "Label and URL are required" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.from("menu_links").insert({
    label: body.label.trim(),
    url: body.url.trim(),
    sort_order: body.sort_order ?? 99
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ link: data });
}
