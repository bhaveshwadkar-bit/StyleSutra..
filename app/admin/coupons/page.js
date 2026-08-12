import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import CouponsManager from "@/components/admin/CouponsManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  await requireAdminPage();
  const { data: coupons } = await supabaseAdmin.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <AdminShell title="Coupon Codes">
      <CouponsManager initialCoupons={coupons || []} />
    </AdminShell>
  );
}
