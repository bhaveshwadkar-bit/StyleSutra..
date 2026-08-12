import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const { data: settings } = await supabaseAdmin.from("settings").select("*").eq("id", 1).single();

  return (
    <AdminShell title="Support & Payment Settings">
      <SettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
