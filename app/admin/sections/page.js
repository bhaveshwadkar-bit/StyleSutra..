import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import SectionsManager from "@/components/admin/SectionsManager";

export const revalidate = 0;

export default async function AdminSectionsPage() {
  await requireAdminPage();
  const { data: sections } = await supabaseAdmin.from("sections").select("*").order("sort_order");

  return (
    <AdminShell title="Sections">
      <SectionsManager initialSections={sections || []} />
    </AdminShell>
  );
}
