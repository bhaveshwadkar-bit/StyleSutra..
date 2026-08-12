export default function Footer({ settings }) {
  const s = settings || {};
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <h4>{s.site_name || "Style Sutra"}</h4>
          <p style={{ maxWidth: 260, fontSize: 13.5 }}>
            Handpicked chains, rings, charms & full chains for him and her.
          </p>
        </div>
        <div>
          <h4>Support</h4>
          <a href={`tel:${s.support_phone_1}`}>{s.support_phone_1}</a>
          {s.support_phone_2 && <a href={`tel:${s.support_phone_2}`}>{s.support_phone_2}</a>}
          <a href={`mailto:${s.support_email}`}>{s.support_email}</a>
        </div>
        <div>
          <h4>Follow</h4>
          <a href={`https://instagram.com/${(s.instagram_id || "").replace("@", "")}`} target="_blank" rel="noreferrer">
            {s.instagram_id}
          </a>
          {s.whatsapp_1 && (
            <a href={`https://wa.me/${s.whatsapp_1.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
              WhatsApp: {s.whatsapp_1}
            </a>
          )}
        </div>
      </div>
      <div className="bottom">
        © {new Date().getFullYear()} {s.site_name || "Style Sutra"}. All rights reserved.
      </div>
    </footer>
  );
}
