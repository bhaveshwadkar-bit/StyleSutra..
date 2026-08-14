"use client";
import { useState } from "react";
import { formatINR } from "@/lib/format";

const STEPS = ["pending_payment", "payment_claimed", "confirmed", "shipped", "delivered"];
const STEP_LABELS = {
  pending_payment: "Order Placed",
  payment_claimed: "Payment Received",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered"
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  const isCancelledOrExpired = order && ["cancelled", "expired"].includes(order.status);
  const currentStepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <main className="container" style={{ padding: "40px 20px 64px", maxWidth: 560 }}>
      <h1 className="font-display">Track Your Order</h1>
      <form className="card" onSubmit={handleTrack} style={{ marginTop: 20 }}>
        <div className="field">
          <label>Order Number</label>
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="e.g. SS260813-4821"
          />
        </div>
        <div className="field">
          <label>Phone Number Used at Checkout</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {order && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="hint" style={{ margin: 0 }}>Order Number</p>
          <h3 style={{ margin: "2px 0 12px" }}>{order.order_number}</h3>

          {isCancelledOrExpired ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <p style={{ fontSize: 32, margin: 0 }}>{order.status === "cancelled" ? "❌" : "⏰"}</p>
              <p style={{ fontWeight: 600, marginTop: 6 }}>
                {order.status === "cancelled" ? "This order was cancelled" : "Payment window expired"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0", position: "relative" }}>
              {STEPS.map((step, i) => (
                <div key={step} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                  <div
                    style={{
                      width: 26, height: 26, borderRadius: "50%", margin: "0 auto 6px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: i <= currentStepIndex ? "var(--rose-gold)" : "var(--line)",
                      color: "white", fontSize: 13, fontWeight: 700
                    }}
                  >
                    {i <= currentStepIndex ? "✓" : i + 1}
                  </div>
                  <p style={{ fontSize: 11, color: i <= currentStepIndex ? "var(--charcoal)" : "var(--text-muted)" }}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
              ))}
            </div>
          )}

          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "14px 0" }} />

          <p style={{ margin: "6px 0" }}><strong>Items:</strong></p>
          <ul style={{ margin: "0 0 10px", paddingLeft: 18 }}>
            {order.items.map((i, idx) => (
              <li key={idx} style={{ fontSize: 14 }}>{i.name} × {i.qty}</li>
            ))}
          </ul>
          <p style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>Total</span><span>{formatINR(order.total)}</span>
          </p>
          <p className="hint">Delivering to: {order.city}, {order.state}</p>
        </div>
      )}
    </main>
  );
}
