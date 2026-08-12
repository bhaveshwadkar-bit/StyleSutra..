import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  const update = {};
  if (body.code !== undefined) update.code = body.code.trim().toUpperCase();
  if (body.discount_type !== undefined) update.discount_type = body.discount_type;
  if (body.discount_value !== undefined) update.discount_value = body.discount_value;
  if (body.max_uses !== undefined) update.max_uses = body.max_uses;
  if (body.is_active !== undefined) update.is_active = body.is_active;

  const { data, error } = await supabaseAdmin.from("coupons").update(update).eq("id", params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ coupon: data });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
