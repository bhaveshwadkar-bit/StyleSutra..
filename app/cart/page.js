"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="container" style={{ padding: "60px 20px" }}>
        <div className="empty-state">
          <p style={{ fontSize: 18 }}>Your cart is empty.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "32px 20px 64px" }}>
      <h1 className="font-display">Your Cart ({items.length} item{items.length > 1 ? "s" : ""})</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 32, marginTop: 20 }}>
        <div className="card">
          {items.map((i) => (
            <div className="cart-row" key={i.product_id}>
              {i.photo ? <img src={i.photo} alt={i.name} /> : <div style={{ width: 68, height: 68, background: "var(--cream-dark)", borderRadius: 10 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, margin: "0 0 4px" }}>{i.name}</p>
                <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{formatINR(i.price)} each</p>
              </div>
              <div className="qty-control">
                <button onClick={() => updateQty(i.product_id, i.qty - 1)}>−</button>
                <span>{i.qty}</span>
                <button onClick={() => updateQty(i.product_id, i.qty + 1)}>+</button>
              </div>
              <p style={{ width: 90, textAlign: "right", fontWeight: 700 }}>{formatINR(i.price * i.qty)}</p>
              <button className="btn btn-sm btn-outline" onClick={() => removeItem(i.product_id)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
            <span>Subtotal</span>
            <strong>{formatINR(subtotal)}</strong>
          </div>
          <p className="hint">Coupon codes can be applied at checkout.</p>
          <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 14 }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
