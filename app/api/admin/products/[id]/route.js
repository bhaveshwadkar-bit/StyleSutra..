import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();

  if ((body.photos || []).length > 5) return Response.json({ error: "Max 5 photos allowed" }, { status: 400 });
  if ((body.videos || []).length > 2) return Response.json({ error: "Max 2 videos allowed" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("products").update({
    section_id: body.section_id || null,
    name: body.name,
    description: body.description || "",
    price: body.price,
    compare_at_price: body.compare_at_price || null,
    stock: body.stock,
    is_active: body.is_active,
    is_featured: body.is_featured ?? false,
    is_best_seller: body.is_best_seller ?? false,
    photos: body.photos || [],
    videos: body.videos || [],
    updated_at: new Date().toISOString()
  }).eq("id", params.id).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ product: data });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
