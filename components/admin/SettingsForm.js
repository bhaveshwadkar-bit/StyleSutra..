"use client";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SettingsForm({ initialSettings }) {
  const s = initialSettings || {};
  const [form, setForm] = useState({
    site_name: s.site_name || "Style Sutra",
    support_phone_1: s.support_phone_1 || "",
    support_phone_2: s.support_phone_2 || "",
    support_email: s.support_email || "",
    instagram_id: s.instagram_id || "",
    whatsapp_1: s.whatsapp_1 || "",
    whatsapp_2: s.whatsapp_2 || "",
    upi_id: s.upi_id || "",
    qr_image_url: s.qr_image_url || "",
    payment_window_minutes: s.payment_window_minutes ?? 10,
    payment_message: s.payment_message || "",
    delivery_charge_text: s.delivery_charge_text || "Delivery charge: ₹49 (FREE above ₹999)",
    delivery_charge_amount: s.delivery_charge_amount ?? 49,
    free_delivery_min_order: s.free_delivery_min_order ?? 999,
    low_stock_threshold: s.low_stock_threshold ?? 5,
    hero_image_url: s.hero_image_url || "",
    hero_title: s.hero_title || "Style Sutra",
    hero_subtitle: s.hero_subtitle || "Handpicked chains, rings, charms & full chains — for him and her.",
    hero_button_text: s.hero_button_text || "Shop Now",
    hero_button_link: s.hero_button_link || "/",
    festival_theme_enabled: s.festival_theme_enabled ?? true,
    festival_theme_name: s.festival_theme_name || "Raksha Bandhan",
    festival_theme_end_at: toLocalInputValue(s.festival_theme_end_at) || "2026-08-29T00:00",
    festival_banner_text: s.festival_banner_text || "🎉 Raksha Bandhan Special — celebrate the bond with a gift from Style Sutra! 🎉"
  });
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleQrUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    setError("");
    try {
      const result = await uploadToCloudinary(file, { maxMB: 10, resourceType: "image" });
      update("qr_image_url", result.url);
    } catch (err) {
      setError(err.message);
    }
    setUploadingQr(false);
    e.target.value = "";
  }

  async function handleHeroUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setError("");
    try {
      const result = await uploadToCloudinary(file, { maxMB: 10, resourceType: "image" });
      update("hero_image_url", result.url);
    } catch (err) {
      setError(err.message);
    }
    setUploadingHero(false);
    e.target.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = {
        ...form,
        festival_theme_end_at: form.festival_theme_end_at ? new Date(form.festival_theme_end_at).toISOString() : null
      };
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <form className="card" onSubmit={handleSave} style={{ maxWidth: 640 }}>
      <h3 style={{ marginTop: 0 }}>Store Name</h3>
      <div className="field">
        <input value={form.site_name} onChange={(e) => update("site_name", e.target.value)} />
      </div>

      <h3>Homepage Hero Banner</h3>
      <div className="field">
        <label>Banner Photo</label>
        <div className="upload-grid">
          {form.hero_image_url && (
            <div className="upload-thumb" style={{ width: 120, height: 84 }}>
              <img src={form.hero_image_url} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" className="remove-btn" onClick={() => update("hero_image_url", "")}>×</button>
            </div>
          )}
          <label className="upload-tile" style={{ width: 120, height: 84 }}>
            {uploadingHero ? "…" : form.hero_image_url ? "Replace" : "+ Add photo"}
            <input type="file" accept="image/*" hidden onChange={handleHeroUpload} disabled={uploadingHero} />
          </label>
        </div>
        <p className="hint">Wide photo works best. Leave empty to use a plain color banner instead.</p>
      </div>
      <div className="field">
        <label>Banner Title</label>
        <input value={form.hero_title} onChange={(e) => update("hero_title", e.target.value)} />
      </div>
      <div className="field">
        <label>Banner Subtitle</label>
        <textarea rows={2} value={form.hero_subtitle} onChange={(e) => update("hero_subtitle", e.target.value)} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Button Text</label>
          <input value={form.hero_button_text} onChange={(e) => update("hero_button_text", e.target.value)} placeholder="Shop Now" />
        </div>
        <div className="field">
          <label>Button Link</label>
          <input value={form.hero_button_link} onChange={(e) => update("hero_button_link", e.target.value)} placeholder="/ or /sections/chains" />
        </div>
      </div>

      <h3>Support Contact</h3>
      <div className="field-row">
        <div className="field">
          <label>Support Phone 1</label>
          <input value={form.support_phone_1} onChange={(e) => update("support_phone_1", e.target.value)} />
        </div>
        <div className="field">
          <label>Support Phone 2</label>
          <input value={form.support_phone_2} onChange={(e) => update("support_phone_2", e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Support Email</label>
        <input type="email" value={form.support_email} onChange={(e) => update("support_email", e.target.value)} />
      </div>

      <h3>Social & WhatsApp</h3>
      <div className="field">
        <label>Instagram ID</label>
        <input value={form.instagram_id} onChange={(e) => update("instagram_id", e.target.value)} placeholder="@stylesutra__" />
      </div>
      <div className="field-row">
        <div className="field">
          <label>WhatsApp Number 1</label>
          <input value={form.whatsapp_1} onChange={(e) => update("whatsapp_1", e.target.value)} placeholder="+91XXXXXXXXXX" />
        </div>
        <div className="field">
          <label>WhatsApp Number 2</label>
          <input value={form.whatsapp_2} onChange={(e) => update("whatsapp_2", e.target.value)} placeholder="+91XXXXXXXXXX" />
        </div>
      </div>

      <h3>Payment (UPI / QR)</h3>
      <div className="field">
        <label>UPI ID</label>
        <input value={form.upi_id} onChange={(e) => update("upi_id", e.target.value)} placeholder="yourid@bank" />
      </div>
      <div className="field">
        <label>QR Code Image</label>
        <div className="upload-grid">
          {form.qr_image_url && (
            <div className="upload-thumb">
              <img src={form.qr_image_url} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              <button type="button" className="remove-btn" onClick={() => update("qr_image_url", "")}>×</button>
            </div>
          )}
          <label className="upload-tile">
            {uploadingQr ? "…" : form.qr_image_url ? "Replace QR" : "+ Upload QR"}
            <input type="file" accept="image/*" hidden onChange={handleQrUpload} disabled={uploadingQr} />
          </label>
        </div>
      </div>
      <div className="field">
        <label>Payment Window (minutes before QR/UPI is hidden)</label>
        <input type="number" min="1" value={form.payment_window_minutes} onChange={(e) => update("payment_window_minutes", Number(e.target.value))} style={{ maxWidth: 140 }} />
      </div>
      <div className="field">
        <label>Payment Instructions Message (shown to customer during checkout)</label>
        <textarea rows={4} value={form.payment_message} onChange={(e) => update("payment_message", e.target.value)} />
      </div>

      <h3>Delivery Charges</h3>
      <div className="field">
        <label>Delivery Message (shown to customers — write anything you like)</label>
        <input
          value={form.delivery_charge_text}
          onChange={(e) => update("delivery_charge_text", e.target.value)}
          placeholder="e.g. Delivery charge: ₹49 (FREE above ₹999)"
        />
        <p className="hint">This text is free-form — you can type any message, numbers, or symbols here.</p>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Delivery Charge Amount (₹)</label>
          <input
            type="number"
            min="0"
            value={form.delivery_charge_amount}
            onChange={(e) => update("delivery_charge_amount", e.target.value)}
          />
          <p className="hint">Added to the order total when below the free-delivery amount.</p>
        </div>
        <div className="field">
          <label>Free Delivery Above (₹)</label>
          <input
            type="number"
            min="0"
            value={form.free_delivery_min_order}
            onChange={(e) => update("free_delivery_min_order", e.target.value)}
          />
          <p className="hint">Set to 0 to always charge delivery.</p>
        </div>
      </div>

      <h3>Stock</h3>
      <div className="field">
        <label>Low Stock Warning Threshold</label>
        <input
          type="number"
          min="1"
          value={form.low_stock_threshold}
          onChange={(e) => update("low_stock_threshold", e.target.value)}
          style={{ maxWidth: 140 }}
        />
        <p className="hint">Shows "Only X left!" on a product when its stock drops to this number or below.</p>
      </div>

      <h3>🎉 Festival Theme (Temporary)</h3>
      <p className="hint">
        Adds a festive banner and color accent across your site until the date below, then automatically
        switches back to normal — nothing else on your site changes, and no action is needed from you when it ends.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.festival_theme_enabled}
          onChange={(e) => update("festival_theme_enabled", e.target.checked)}
          style={{ width: "auto" }}
        />
        <strong>Show festival theme</strong>
      </label>
      <div className="field">
        <label>Festival Name</label>
        <input value={form.festival_theme_name} onChange={(e) => update("festival_theme_name", e.target.value)} />
      </div>
      <div className="field">
        <label>Ends On (auto-reverts after this date/time)</label>
        <input
          type="datetime-local"
          value={form.festival_theme_end_at}
          onChange={(e) => update("festival_theme_end_at", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Banner Text</label>
        <input value={form.festival_banner_text} onChange={(e) => update("festival_banner_text", e.target.value)} />
      </div>

      {error && <p className="error-text">{error}</p>}
      {saved && <p style={{ color: "var(--success)" }}>Settings saved ✓</p>}
      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
