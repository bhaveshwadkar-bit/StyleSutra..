import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import LaunchManager from "@/components/admin/LaunchManager";

export const revalidate = 0;

export default async function AdminLaunchPage() {
  await requireAdminPage();
  const { data: settings } = await supabaseAdmin.from("settings").select("*").eq("id", 1).single();

  return (
    <AdminShell title="Launch & Maintenance">
      <LaunchManager initialSettings={settings} />
    </AdminShell>
  );
}
