import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import OrdersManager from "@/components/admin/OrdersManager";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const { data: orders } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <AdminShell title="Orders">
      <OrdersManager initialOrders={orders || []} />
    </AdminShell>
  );
}
