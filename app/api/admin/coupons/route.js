import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ coupons: data });
}

export async function POST(request) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from("coupons").insert({
    code: body.code.trim().toUpperCase(),
    discount_type: body.discount_type,
    discount_value: body.discount_value,
    max_uses: body.max_uses || 1,
    is_active: true
  }).select().single();
  if (error) return Response.json({ error: error.message.includes("duplicate") ? "This coupon code already exists" : error.message }, { status: 500 });
  return Response.json({ coupon: data });
}
