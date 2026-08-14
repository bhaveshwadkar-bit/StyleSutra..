"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    Promise.all([
      supabase.from("sections").select("*").order("sort_order"),
      supabase.from("settings").select("*").eq("id", 1).single()
    ]).then(([sectionsRes, settingsRes]) => {
      setSections(sectionsRes.data || []);
      setSettings(settingsRes.data || null);
      setLoaded(true);
    });
  }, [open, loaded]);

  return (
    <>
      <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>

      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="font-display" style={{ fontSize: 20 }}>Menu</span>
              <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">×</button>
            </div>

            <nav className="drawer-links">
              <Link href="/" onClick={() => setOpen(false)}>Shop All</Link>
              <Link href="/track" onClick={() => setOpen(false)}>Track Order</Link>
              <Link href="/support" onClick={() => setOpen(false)}>Support</Link>
            </nav>

            {sections.length > 0 && (
              <div className="drawer-section">
                <p className="drawer-section-title">Shop by Category</p>
                {sections.map((s) => (
                  <Link key={s.id} href={`/sections/${s.slug}`} onClick={() => setOpen(false)}>
                    {s.name}
                  </Link>
                ))}
              </div>
            )}

            {settings && (
              <div className="drawer-section">
                <p className="drawer-section-title">Get in Touch</p>
                {settings.support_phone_1 && <a href={`tel:${settings.support_phone_1}`}>📞 {settings.support_phone_1}</a>}
                {settings.support_email && <a href={`mailto:${settings.support_email}`}>✉️ {settings.support_email}</a>}
                {settings.instagram_id && (
                  <a href={`https://instagram.com/${settings.instagram_id.replace("@", "")}`} target="_blank" rel="noreferrer">
                    📷 {settings.instagram_id}
                  </a>
                )}
                {settings.whatsapp_1 && (
                  <a href={`https://wa.me/${settings.whatsapp_1.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    💬 WhatsApp: {settings.whatsapp_1}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
