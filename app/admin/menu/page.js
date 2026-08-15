import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import MenuLinksManager from "@/components/admin/MenuLinksManager";

export const revalidate = 0;

export default async function AdminMenuPage() {
  await requireAdminPage();
  const { data: links } = await supabaseAdmin.from("menu_links").select("*").order("sort_order");

  return (
    <AdminShell title="Site Menu (☰ button)">
      <MenuLinksManager initialLinks={links || []} />
    </AdminShell>
  );
}
