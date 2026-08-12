"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";

export default function OrderPaymentClient({ order: initialOrder, settings }) {
  const [order, setOrder] = useState(initialOrder);
  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(0, Math.floor((new Date(order.payment_deadline) - new Date()) / 1000))
  );
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (order.status !== "pending_payment") return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [order.status]);

  const expired = secondsLeft <= 0 && order.status === "pending_payment";
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  async function claimPayment() {
    setClaiming(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim_payment" })
      });
      const data = await res.json();
      if (res.ok) setOrder(data.order);
    } catch (e) {}
    setClaiming(false);
  }

  const waLink = (num) => `https://wa.me/${(num || "").replace(/\D/g, "")}`;
  const igLink = `https://instagram.com/${(settings?.instagram_id || "").replace("@", "")}`;

  return (
    <main className="container" style={{ padding: "36px 20px 64px", maxWidth: 640 }}>
      <div className="card payment-panel">
        <p className="hint" style={{ marginBottom: 0 }}>Order Number</p>
        <h2 className="font-display" style={{ margin: "2px 0 4px" }}>{order.order_number}</h2>
        <p style={{ fontSize: 20, fontWeight: 700, color: "var(--rose-gold-dark)" }}>{formatINR(order.total)}</p>

        {order.status === "pending_payment" && !expired && (
          <>
            <p className="hint">Complete payment within</p>
            <div className="payment-timer">{mm}:{ss}</div>

            <div className="qr-box">
              {settings?.qr_image_url ? (
                <img src={settings.qr_image_url} alt="UPI QR Code" style={{ width: 220, height: 220, objectFit: "contain" }} />
              ) : (
                <div style={{ width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  QR not uploaded yet
                </div>
              )}
            </div>
            <p className="hint">Scan with any UPI app, or pay directly to:</p>
            <div className="upi-id">{settings?.upi_id}</div>

            <div className="contact-note">
              <p style={{ margin: 0 }}>{settings?.payment_message}</p>
              <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
                {settings?.instagram_id && (
                  <a href={igLink} target="_blank" rel="noreferrer">📷 {settings.instagram_id}</a>
                )}
                {settings?.whatsapp_1 && (
                  <a href={waLink(settings.whatsapp_1)} target="_blank" rel="noreferrer">💬 WhatsApp: {settings.whatsapp_1}</a>
                )}
                {settings?.whatsapp_2 && (
                  <a href={waLink(settings.whatsapp_2)} target="_blank" rel="noreferrer">💬 WhatsApp: {settings.whatsapp_2}</a>
                )}
              </div>
            </div>

            <button className="btn btn-dark btn-block" style={{ marginTop: 18 }} onClick={claimPayment} disabled={claiming}>
              {claiming ? "Please wait…" : "I've completed the payment"}
            </button>
          </>
        )}

        {order.status === "payment_claimed" && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 40 }}>✅</p>
            <h3>Payment noted — thank you!</h3>
            <p className="hint">
              Please send your payment screenshot on WhatsApp or Instagram so we can confirm and place your order within 24hrs.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10 }}>
              {settings?.whatsapp_1 && <a className="btn btn-primary btn-sm" href={waLink(settings.whatsapp_1)} target="_blank" rel="noreferrer">WhatsApp Us</a>}
              {settings?.instagram_id && <a className="btn btn-outline btn-sm" href={igLink} target="_blank" rel="noreferrer">Message on Instagram</a>}
            </div>
          </div>
        )}

        {(expired || order.status === "expired") && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 40 }}>⏰</p>
            <h3>Payment window expired</h3>
            <p className="hint">The QR code and UPI ID for this order are no longer active. Please contact support to reopen this order or place a new one.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10 }}>
              {settings?.whatsapp_1 && <a className="btn btn-primary btn-sm" href={waLink(settings.whatsapp_1)} target="_blank" rel="noreferrer">Contact on WhatsApp</a>}
              <Link className="btn btn-outline btn-sm" href="/">Back to Shop</Link>
            </div>
          </div>
        )}

        {["confirmed", "shipped", "delivered"].includes(order.status) && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 40 }}>🎉</p>
            <h3>Order {order.status}!</h3>
          </div>
        )}

        {order.status === "cancelled" && (
          <div style={{ marginTop: 20 }}>
            <h3>Order cancelled</h3>
            <p className="hint">If you believe this is a mistake, please contact support.</p>
          </div>
        )}
      </div>
    </main>
  );
}
