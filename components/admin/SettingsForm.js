"use client";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
    payment_message: s.payment_message || ""
  });
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

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
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

      {error && <p className="error-text">{error}</p>}
      {saved && <p style={{ color: "var(--success)" }}>Settings saved ✓</p>}
      <button className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
