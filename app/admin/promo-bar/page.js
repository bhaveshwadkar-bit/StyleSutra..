import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import PromoBarManager from "@/components/admin/PromoBarManager";

export const revalidate = 0;

export default async function AdminPromoBarPage() {
  await requireAdminPage();
  const { data: messages } = await supabaseAdmin.from("promo_messages").select("*").order("sort_order");

  return (
    <AdminShell title="Scrolling Promo Bar">
      <PromoBarManager initialMessages={messages || []} />
    </AdminShell>
  );
}
