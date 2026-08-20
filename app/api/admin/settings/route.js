import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function PUT(request) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from("settings").update({
    site_name: body.site_name,
    support_phone_1: body.support_phone_1,
    support_phone_2: body.support_phone_2,
    support_email: body.support_email,
    instagram_id: body.instagram_id,
    whatsapp_1: body.whatsapp_1,
    whatsapp_2: body.whatsapp_2,
    upi_id: body.upi_id,
    qr_image_url: body.qr_image_url,
    payment_window_minutes: body.payment_window_minutes,
    payment_message: body.payment_message,
    delivery_charge_text: body.delivery_charge_text,
    delivery_charge_amount: body.delivery_charge_amount,
    free_delivery_min_order: body.free_delivery_min_order,
    low_stock_threshold: body.low_stock_threshold,
    hero_image_url: body.hero_image_url,
    hero_title: body.hero_title,
    hero_subtitle: body.hero_subtitle,
    hero_button_text: body.hero_button_text,
    hero_button_link: body.hero_button_link,
    launch_gate_enabled: body.launch_gate_enabled,
    launch_at: body.launch_at,
    launch_message: body.launch_message,
    launch_subtext: body.launch_subtext,
    maintenance_mode_enabled: body.maintenance_mode_enabled,
    maintenance_message: body.maintenance_message
  }).eq("id", 1).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ settings: data });
}
