import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Public order lookup — requires BOTH order number and phone number to match,
// so customers can only see their own order, not browse others.
export async function POST(request) {
  const { order_number, phone } = await request.json();
  if (!order_number || !phone) {
    return Response.json({ error: "Enter your order number and phone number" }, { status: 400 });
  }

  const last10 = phone.replace(/\D/g, "").slice(-10);

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, status, items, total, delivery_charge, discount, created_at, customer_name, customer_phone, city, state")
    .ilike("order_number", order_number.trim())
    .single();

  if (error || !order) {
    return Response.json({ error: "No order found with that order number" }, { status: 404 });
  }

  const orderLast10 = (order.customer_phone || "").replace(/\D/g, "").slice(-10);
  if (orderLast10 !== last10) {
    return Response.json({ error: "Order number and phone number don't match" }, { status: 403 });
  }

  return Response.json({ order });
}
