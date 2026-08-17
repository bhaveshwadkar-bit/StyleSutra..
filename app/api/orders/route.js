import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateOrderNumber } from "@/lib/format";

export async function POST(request) {
  const body = await request.json();
  const {
    items, customer_name, customer_phone, customer_email,
    address_line, city, state, pincode, coupon_code
  } = body;

  if (!items || items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!customer_name || !customer_phone || !address_line || !city || !state || !pincode) {
    return Response.json({ error: "Please fill all required delivery details" }, { status: 400 });
  }
  if (!/^\d{10}$/.test(customer_phone.replace(/\D/g, "").slice(-10))) {
    return Response.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0);

  // Validate coupon server-side (never trust client-computed discount)
  let discount = 0;
  let appliedCode = null;
  if (coupon_code) {
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .ilike("code", coupon_code.trim())
      .single();

    if (coupon && coupon.is_active && coupon.used_count < coupon.max_uses) {
      discount = coupon.discount_type === "percent"
        ? Math.round((subtotal * Number(coupon.discount_value)) / 100)
        : Number(coupon.discount_value);
      discount = Math.min(discount, subtotal);
      appliedCode = coupon.code;

      await supabaseAdmin
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("id", coupon.id);
    } else {
      return Response.json({ error: "This coupon code is invalid or has expired" }, { status: 400 });
    }
  }

  const total = Math.max(0, subtotal - discount);

  const { data: settings } = await supabaseAdmin.from("settings").select("payment_window_minutes").eq("id", 1).single();
  const windowMin = settings?.payment_window_minutes ?? 10;
  const payment_deadline = new Date(Date.now() + windowMin * 60 * 1000).toISOString();

  const order_number = generateOrderNumber();

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number,
      items,
      subtotal,
      discount,
      coupon_code: appliedCode,
      total,
      customer_name, customer_phone, customer_email,
      address_line, city, state, pincode,
      status: "pending_payment",
      payment_deadline
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ order });
}

export async function GET(request) {
  // Admin: list orders (protected)
  const { isAdminAuthed } = await import("@/lib/auth");
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ orders: data });
}
