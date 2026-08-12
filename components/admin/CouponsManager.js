"use client";
import { useState } from "react";

export default function CouponsManager({ initialCoupons }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: "", max_uses: 1 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addCoupon(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupons((prev) => [data.coupon, ...prev]);
      setForm({ code: "", discount_type: "percent", discount_value: "", max_uses: 1 });
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function toggleActive(c) {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active })
    });
    const data = await res.json();
    if (res.ok) setCoupons((prev) => prev.map((x) => (x.id === c.id ? data.coupon : x)));
  }

  async function deleteCoupon(id) {
    if (!confirm("Delete this coupon code?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <form className="card" onSubmit={addCoupon} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Create Coupon Code</h3>
        <div className="field-row">
          <div className="field">
            <label>Code</label>
            <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. WELCOME10" />
          </div>
          <div className="field">
            <label>Discount Type</label>
            <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Discount Value</label>
            <input required type="number" min="0" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))} />
          </div>
          <div className="field">
            <label>Max Uses (e.g. 2, 4...)</label>
            <input required type="number" min="1" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>Create Coupon</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr><th>Code</th><th>Discount</th><th>Used</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.code}</strong></td>
              <td>{c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
              <td>{c.used_count} / {c.max_uses}</td>
              <td>
                <span className={`badge ${c.is_active ? "badge-confirmed" : "badge-cancelled"}`}>
                  {c.is_active ? "Active" : "Disabled"}
                </span>
              </td>
              <td style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-outline" onClick={() => toggleActive(c)}>
                  {c.is_active ? "Disable" : "Enable"}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteCoupon(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {coupons.length === 0 && (
            <tr><td colSpan={5} className="hint" style={{ padding: 20 }}>No coupons yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
