"use client";
import { useState } from "react";

// Converts a stored ISO timestamp into the value a <input type="datetime-local">
// expects (local time, no seconds/timezone suffix), and back again on save.
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LaunchManager({ initialSettings }) {
  const s = initialSettings || {};
  const [form, setForm] = useState({
    launch_gate_enabled: s.launch_gate_enabled ?? false,
    launch_at: toLocalInputValue(s.launch_at),
    launch_message: s.launch_message || "We're launching soon!",
    launch_subtext: s.launch_subtext || "Something beautiful is on its way. Check back soon.",
    maintenance_mode_enabled: s.maintenance_mode_enabled ?? false,
    maintenance_message: s.maintenance_message || "We're currently updating our store. Please check back shortly!"
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload = {
        ...form,
        // Convert the local datetime-local value back to a real ISO timestamp, or null if cleared.
        launch_at: form.launch_at ? new Date(form.launch_at).toISOString() : null
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
      <h3 style={{ marginTop: 0 }}>🚀 Launch Countdown</h3>
      <p className="hint">
        Turn this on before you're ready to launch. Customers visiting your link will see a countdown
        page instead of your store. It switches to your real store automatically once the launch time
        passes — or you can turn it off manually anytime for an instant launch.
      </p>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.launch_gate_enabled}
          onChange={(e) => update("launch_gate_enabled", e.target.checked)}
          style={{ width: "auto" }}
        />
        <strong>Show "Coming Soon" page to customers</strong>
      </label>

      <div className="field">
        <label>Launch Date & Time (optional — shows a live countdown)</label>
        <input
          type="datetime-local"
          value={form.launch_at}
          onChange={(e) => update("launch_at", e.target.value)}
        />
        <p className="hint">Leave empty to show the message with no countdown timer.</p>
      </div>
      <div className="field">
        <label>Heading</label>
        <input value={form.launch_message} onChange={(e) => update("launch_message", e.target.value)} />
      </div>
      <div className="field">
        <label>Subtext</label>
        <textarea rows={2} value={form.launch_subtext} onChange={(e) => update("launch_subtext", e.target.value)} />
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "22px 0" }} />

      <h3>🛠️ Maintenance Mode</h3>
      <p className="hint">
        Use this any time your store is already live but you need to briefly hide it — for restocking,
        fixing an issue, etc. This overrides the launch countdown above if both are on.
      </p>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={form.maintenance_mode_enabled}
          onChange={(e) => update("maintenance_mode_enabled", e.target.checked)}
          style={{ width: "auto" }}
        />
        <strong>Put store in Maintenance Mode right now</strong>
      </label>

      <div className="field">
        <label>Maintenance Message</label>
        <textarea rows={2} value={form.maintenance_message} onChange={(e) => update("maintenance_message", e.target.value)} />
      </div>

      {error && <p className="error-text">{error}</p>}
      {saved && <p style={{ color: "var(--success)" }}>Saved ✓ — changes apply to your live site within a few seconds.</p>}
      <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
    </form>
  );
}
