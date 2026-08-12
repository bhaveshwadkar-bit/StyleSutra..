import { supabaseAdmin } from "@/lib/supabaseAdmin";
import OrderPaymentClient from "@/components/OrderPaymentClient";

export const revalidate = 0;

export default async function OrderPage({ params }) {
  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single();
  const { data: settings } = await supabaseAdmin.from("settings").select("*").eq("id", 1).single();

  if (!order) {
    return <div className="container empty-state">Order not found.</div>;
  }

  return <OrderPaymentClient order={order} settings={settings} />;
}
