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
    payment_message: body.payment_message
  }).eq("id", 1).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ settings: data });
}
