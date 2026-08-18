import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function GET(request, { params }) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 404 });

  // Auto-expire if payment window passed and still pending
  if (data.status === "pending_payment" && new Date(data.payment_deadline) < new Date()) {
    await supabaseAdmin.from("orders").update({ status: "expired" }).eq("id", data.id);
    data.status = "expired";
  }

  return Response.json({ order: data });
}

export async function PATCH(request, { params }) {
  const body = await request.json();

  // Public action: customer claims they've paid (before admin manually confirms)
  if (body.action === "claim_payment") {
    const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single();
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "pending_payment") {
      return Response.json({ error: "This order can no longer be marked as paid" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status: "payment_claimed" })
      .eq("id", params.id)
      .select()
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ order: data });
  }

  // Everything else (status changes) is admin-only
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });

  const allowed = ["pending_payment", "payment_claimed", "confirmed", "shipped", "delivered", "cancelled", "expired"];
  if (!allowed.includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status: body.status })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ order: data });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });

  const { data: order } = await supabaseAdmin.from("orders").select("status").eq("id", params.id).single();
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  // Safety guard: only allow deleting orders that are finished/dead, never active ones.
  const deletable = ["delivered", "cancelled", "expired"];
  if (!deletable.includes(order.status)) {
    return Response.json(
      { error: "Only delivered, cancelled, or expired orders can be deleted." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("orders").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
