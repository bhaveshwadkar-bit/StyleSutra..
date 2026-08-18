import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("sections").select("*").order("sort_order");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ sections: data });
}

export async function POST(request) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  const slug = slugify(body.name);
  const { data, error } = await supabaseAdmin.from("sections").insert({
    name: body.name, slug, sort_order: body.sort_order ?? 99, parent_id: body.parent_id || null
  }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ section: data });
}
