import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function SupportPage() {
  const { data: s } = await supabase.from("settings").select("*").eq("id", 1).single();

  return (
    <main className="container" style={{ padding: "40px 20px 64px", maxWidth: 560 }}>
      <h1 className="font-display">Support & Help</h1>
      <div className="card" style={{ marginTop: 20 }}>
        <p><strong>Call us:</strong></p>
        <p><a href={`tel:${s?.support_phone_1}`}>{s?.support_phone_1}</a></p>
        {s?.support_phone_2 && <p><a href={`tel:${s.support_phone_2}`}>{s.support_phone_2}</a></p>}
        <p style={{ marginTop: 14 }}><strong>Email us:</strong></p>
        <p><a href={`mailto:${s?.support_email}`}>{s?.support_email}</a></p>
        <p style={{ marginTop: 14 }}><strong>Instagram:</strong></p>
        <p><a href={`https://instagram.com/${(s?.instagram_id || "").replace("@", "")}`} target="_blank" rel="noreferrer">{s?.instagram_id}</a></p>
        <p style={{ marginTop: 14 }}><strong>WhatsApp:</strong></p>
        {s?.whatsapp_1 && <p><a href={`https://wa.me/${s.whatsapp_1.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{s.whatsapp_1}</a></p>}
        {s?.whatsapp_2 && <p><a href={`https://wa.me/${s.whatsapp_2.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{s.whatsapp_2}</a></p>}
      </div>
    </main>
  );
}
