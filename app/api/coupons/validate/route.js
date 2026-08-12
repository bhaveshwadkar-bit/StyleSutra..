import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const { code, subtotal } = await request.json();
  if (!code) return Response.json({ error: "Enter a coupon code" }, { status: 400 });

  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .single();

  if (!coupon || !coupon.is_active || coupon.used_count >= coupon.max_uses) {
    return Response.json({ error: "Invalid or expired coupon code" }, { status: 400 });
  }

  let discount = coupon.discount_type === "percent"
    ? Math.round((subtotal * Number(coupon.discount_value)) / 100)
    : Number(coupon.discount_value);
  discount = Math.min(discount, subtotal);

  return Response.json({ valid: true, discount, code: coupon.code });
}
