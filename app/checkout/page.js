"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    address_line: "", city: "", state: "", pincode: ""
  });
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null); // {code, discount}
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupon({ code: data.code, discount: data.discount });
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message);
    }
    setCheckingCoupon(false);
  }

  const discount = coupon?.discount || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const freeDeliveryMin = Number(settings?.free_delivery_min_order ?? 0);
  const deliveryChargeAmount = Number(settings?.delivery_charge_amount ?? 0);
  const deliveryCharge = freeDeliveryMin > 0 && afterDiscount >= freeDeliveryMin ? 0 : deliveryChargeAmount;
  const total = afterDiscount + deliveryCharge;
  const amountToFreeDelivery = freeDeliveryMin > 0 ? Math.max(0, freeDeliveryMin - afterDiscount) : 0;

  async function placeOrder(e) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          ...form,
          coupon_code: coupon?.code || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place order");
      clearCart();
      router.push(`/order/${data.order.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="container" style={{ padding: "60px 20px" }}>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "32px 20px 64px" }}>
      <h1 className="font-display">Checkout</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, marginTop: 20, alignItems: "start" }}>
        <form className="card" onSubmit={placeOrder}>
          <h3 style={{ marginTop: 0 }}>Delivery Details</h3>
          <div className="field">
            <label>Full Name *</label>
            <input required value={form.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Phone Number *</label>
              <input required type="tel" value={form.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} placeholder="10-digit mobile number" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.customer_email} onChange={(e) => update("customer_email", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Address *</label>
            <textarea required rows={2} value={form.address_line} onChange={(e) => update("address_line", e.target.value)} placeholder="House no, street, area, landmark" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>City *</label>
              <input required value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="field">
              <label>State *</label>
              <input required value={form.state} onChange={(e) => update("state", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Pincode *</label>
            <input required value={form.pincode} onChange={(e) => update("pincode", e.target.value)} style={{ maxWidth: 180 }} />
          </div>

          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Placing Order…" : `Place Order — ${formatINR(total)}`}
          </button>
          <p className="hint" style={{ textAlign: "center", marginTop: 8 }}>
            Includes {formatINR(deliveryCharge)} delivery {deliveryCharge === 0 && "(free)"}
          </p>
        </form>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          {items.map((i) => (
            <div key={i.product_id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, margin: "6px 0" }}>
              <span>{i.name} × {i.qty}</span>
              <span>{formatINR(i.price * i.qty)}</span>
            </div>
          ))}
          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "12px 0" }} />

          <div className="field" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label>Coupon Code</label>
              <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" />
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={checkingCoupon}>
              {checkingCoupon ? "…" : "Apply"}
            </button>
          </div>
          {couponError && <p className="error-text">{couponError}</p>}
          {coupon && <p style={{ color: "var(--success)", fontSize: 13.5 }}>Coupon "{coupon.code}" applied ✓</p>}

          <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0" }}>
            <span>Subtotal</span><span>{formatINR(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", color: "var(--success)" }}>
              <span>Discount</span><span>−{formatINR(discount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0" }}>
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? <span style={{ color: "var(--success)" }}>FREE</span> : formatINR(deliveryCharge)}</span>
          </div>
          {settings?.delivery_charge_text && (
            <p className="hint" style={{ margin: "0 0 6px" }}>{settings.delivery_charge_text}</p>
          )}
          {deliveryCharge > 0 && amountToFreeDelivery > 0 && (
            <p style={{ color: "var(--rose-gold-dark)", fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>
              Add {formatINR(amountToFreeDelivery)} more for FREE delivery!
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, marginTop: 8 }}>
            <span>Total</span><span>{formatINR(total)}</span>
          </div>
          <p className="hint" style={{ marginTop: 14 }}>Payment via UPI/QR on the next step.</p>
        </div>
      </div>
    </main>
  );
}
