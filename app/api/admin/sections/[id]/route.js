import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PUT(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from("sections").update({
    name: body.name, slug: slugify(body.name), sort_order: body.sort_order
  }).eq("id", params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ section: data });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { error } = await supabaseAdmin.from("sections").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
