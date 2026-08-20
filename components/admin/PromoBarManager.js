"use client";
import { useState } from "react";

export default function PromoBarManager({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addMessage(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/promo-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sort_order: messages.length + 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function deleteMessage(id) {
    if (!confirm("Remove this message from the scrolling bar?")) return;
    const res = await fetch(`/api/admin/promo-messages/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function move(id, direction) {
    const idx = messages.findIndex((m) => m.id === id);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= messages.length) return;
    const reordered = [...messages];
    [reordered[idx], reordered[swapWith]] = [reordered[swapWith], reordered[idx]];
    reordered.forEach((m, i) => (m.sort_order = i + 1));
    setMessages(reordered);
    await Promise.all(
      reordered.map((m) =>
        fetch(`/api/admin/promo-messages/${m.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(m)
        })
      )
    );
  }

  return (
    <div>
      <p className="hint" style={{ marginBottom: 16 }}>
        These messages scroll at the very top of your site (above the header), like "Use code VADAPAV for 3% off."
        Add as many as you like — they cycle automatically with arrows to browse.
      </p>

      <form className="card" onSubmit={addMessage} style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Message</label>
          <input required value={text} onChange={(e) => setText(e.target.value)} placeholder='e.g. Free delivery on orders above ₹999' />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>Add Message</button>
      </form>

      {messages.map((m, i) => (
        <div key={m.id} className="card" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{m.text}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-sm btn-outline" onClick={() => move(m.id, "up")} disabled={i === 0}>↑</button>
            <button className="btn btn-sm btn-outline" onClick={() => move(m.id, "down")} disabled={i === messages.length - 1}>↓</button>
            <button className="btn btn-sm btn-danger" onClick={() => deleteMessage(m.id)}>Delete</button>
          </div>
        </div>
      ))}
      {messages.length === 0 && <p className="hint">No promo messages yet — add one above.</p>}
    </div>
  );
}
