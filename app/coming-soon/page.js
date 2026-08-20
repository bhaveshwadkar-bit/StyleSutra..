import { supabase } from "@/lib/supabaseClient";
import GateClient from "@/components/GateClient";

export const revalidate = 0;

export default async function ComingSoonPage() {
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();

  const isMaintenance = settings?.maintenance_mode_enabled === true;

  return (
    <GateClient
      mode={isMaintenance ? "maintenance" : "launch"}
      siteName={settings?.site_name || "Style Sutra"}
      title={isMaintenance ? "We'll be right back" : (settings?.launch_message || "We're launching soon!")}
      subtitle={
        isMaintenance
          ? (settings?.maintenance_message || "We're currently updating our store. Please check back shortly!")
          : (settings?.launch_subtext || "Something beautiful is on its way. Check back soon.")
      }
      launchAt={settings?.launch_at || null}
      instagramId={settings?.instagram_id || ""}
      whatsapp={settings?.whatsapp_1 || ""}
    />
  );
}
