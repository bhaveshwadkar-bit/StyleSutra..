"use client";
import { useState, Fragment } from "react";
import { formatINR } from "@/lib/format";

const STATUS_OPTIONS = ["pending_payment", "payment_claimed", "confirmed", "shipped", "delivered", "cancelled", "expired"];

const BADGE_CLASS = {
  pending_payment: "badge-pending",
  payment_claimed: "badge-claimed",
  confirmed: "badge-confirmed",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
  expired: "badge-cancelled"
};

export default function OrdersManager({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  async function updateStatus(id, status) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (res.ok) setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
  }

  async function deleteOrder(id, orderNumber) {
    if (!confirm(`Permanently delete order ${orderNumber}? This cannot be undone.`)) return;
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setExpandedId(null);
    } else {
      alert(data.error || "Could not delete this order.");
    }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1.5px solid var(--line)" }}>
          <option value="all">All Orders ({orders.length})</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")} ({orders.filter((o) => o.status === s).length})</option>
          ))}
        </select>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th></tr>
        </thead>
        <tbody>
          {filtered.map((o) => (
            <Fragment key={o.id}>
              <tr style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                <td><strong>{o.order_number}</strong></td>
                <td>{o.customer_name}<br /><span className="hint">{o.customer_phone}</span></td>
                <td>{o.items.length} item(s)</td>
                <td>{formatINR(o.total)}</td>
                <td><span className={`badge ${BADGE_CLASS[o.status] || "badge-pending"}`}>{o.status.replace("_", " ")}</span></td>
                <td>{new Date(o.created_at).toLocaleString("en-IN")}</td>
              </tr>
              {expandedId === o.id && (
                <tr>
                  <td colSpan={6} style={{ background: "var(--cream-dark)" }}>
                    <div style={{ padding: 14 }}>
                      <p><strong>Delivery Address:</strong> {o.address_line}, {o.city}, {o.state} - {o.pincode}</p>
                      {o.customer_email && <p><strong>Email:</strong> {o.customer_email}</p>}
                      {o.coupon_code && <p><strong>Coupon:</strong> {o.coupon_code} (−{formatINR(o.discount)})</p>}
                      {o.delivery_charge > 0 && <p><strong>Delivery Charge:</strong> {formatINR(o.delivery_charge)}</p>}
                      <p><strong>Items:</strong></p>
                      <ul>
                        {o.items.map((i, idx) => (
                          <li key={idx}>{i.name} × {i.qty} — {formatINR(i.price * i.qty)}</li>
                        ))}
                      </ul>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                        <label style={{ fontWeight: 600, fontSize: 13.5 }}>Update Status:</label>
                        <select
                          value={o.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          style={{ padding: 8, borderRadius: 8, border: "1.5px solid var(--line)" }}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </select>
                        {["delivered", "cancelled", "expired"].includes(o.status) && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => { e.stopPropagation(); deleteOrder(o.id, o.order_number); }}
                          >
                            Delete Order
                          </button>
                        )}
                      </div>
                      {!["delivered", "cancelled", "expired"].includes(o.status) && (
                        <p className="hint" style={{ marginTop: 6 }}>
                          Orders can only be deleted once they're delivered, cancelled, or expired.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="hint" style={{ padding: 20 }}>No orders here.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
