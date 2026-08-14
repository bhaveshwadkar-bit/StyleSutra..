"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

  const topLevel = sections.filter((s) => !s.parent_id);
  const childrenOf = (id) => sections.filter((s) => s.parent_id === id);

  // Only treat a contact field as present if it has real, non-whitespace content.
  const has = (val) => typeof val === "string" && val.trim().length > 0;

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

            <div className="drawer-section">
              <p className="drawer-section-title">Shop by Category</p>
              {!loaded && <p className="hint">Loading…</p>}
              {loaded && topLevel.length === 0 && (
                <p className="hint">No categories added yet.</p>
              )}
              {topLevel.map((s) => {
                const kids = childrenOf(s.id);
                const isExpanded = expandedId === s.id;
                return (
                  <div key={s.id} className="drawer-category">
                    <div className="drawer-category-row">
                      <Link href={`/sections/${s.slug}`} onClick={() => setOpen(false)}>
                        {s.name}
                      </Link>
                      {kids.length > 0 && (
                        <button
                          className="drawer-expand-btn"
                          onClick={() => setExpandedId(isExpanded ? null : s.id)}
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? "−" : "+"}
                        </button>
                      )}
                    </div>
                    {isExpanded && kids.length > 0 && (
                      <div className="drawer-subcategory-list">
                        {kids.map((child) => (
                          <Link key={child.id} href={`/sections/${child.slug}`} onClick={() => setOpen(false)}>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {settings && (has(settings.support_phone_1) || has(settings.support_email) || has(settings.instagram_id) || has(settings.whatsapp_1)) && (
              <div className="drawer-section">
                <p className="drawer-section-title">Get in Touch</p>
                {has(settings.support_phone_1) && <a href={`tel:${settings.support_phone_1}`}>📞 {settings.support_phone_1}</a>}
                {has(settings.support_email) && <a href={`mailto:${settings.support_email}`}>✉️ {settings.support_email}</a>}
                {has(settings.instagram_id) && (
                  <a href={`https://instagram.com/${settings.instagram_id.replace("@", "")}`} target="_blank" rel="noreferrer">
                    📷 {settings.instagram_id}
                  </a>
                )}
                {has(settings.whatsapp_1) && (
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
