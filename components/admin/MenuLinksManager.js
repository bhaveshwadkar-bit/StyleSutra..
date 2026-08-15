"use client";
import { useState } from "react";

export default function MenuLinksManager({ initialLinks }) {
  const [links, setLinks] = useState(initialLinks);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addLink(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/menu-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url, sort_order: links.length + 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLinks((prev) => [...prev, data.link]);
      setLabel("");
      setUrl("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function updateLink(id, field, value) {
    const link = links.find((l) => l.id === id);
    const updated = { ...link, [field]: value };
    setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
    await fetch(`/api/admin/menu-links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
  }

  async function deleteLink(id) {
    if (!confirm("Remove this link from the menu?")) return;
    const res = await fetch(`/api/admin/menu-links/${id}`, { method: "DELETE" });
    if (res.ok) setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function move(id, direction) {
    const idx = links.findIndex((l) => l.id === id);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= links.length) return;
    const reordered = [...links];
    [reordered[idx], reordered[swapWith]] = [reordered[swapWith], reordered[idx]];
    reordered.forEach((l, i) => (l.sort_order = i + 1));
    setLinks(reordered);
    await Promise.all(
      reordered.map((l) =>
        fetch(`/api/admin/menu-links/${l.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(l)
        })
      )
    );
  }

  return (
    <div>
      <p className="hint" style={{ marginBottom: 16 }}>
        These are the top links shown in your site's ☰ menu (above "Shop by Category"). Add, rename, reorder,
        or delete them any time — changes appear on your live site immediately.
      </p>

      <form className="card" onSubmit={addLink} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Add a Menu Link</h3>
        <div className="field-row">
          <div className="field">
            <label>Label (what customers see)</label>
            <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. New Arrivals" />
          </div>
          <div className="field">
            <label>Link (page path or full URL)</label>
            <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. /sections/chains or https://..." />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>Add Link</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr><th>Label</th><th>URL</th><th>Order</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {links.map((l, i) => (
            <MenuLinkRow
              key={l.id}
              link={l}
              onUpdate={updateLink}
              onDelete={deleteLink}
              onMoveUp={() => move(l.id, "up")}
              onMoveDown={() => move(l.id, "down")}
              isFirst={i === 0}
              isLast={i === links.length - 1}
            />
          ))}
          {links.length === 0 && (
            <tr><td colSpan={4} className="hint" style={{ padding: 20 }}>No menu links yet — add one above.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MenuLinkRow({ link, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);

  function save() {
    onUpdate(link.id, "label", label);
    onUpdate(link.id, "url", url);
    setEditing(false);
  }

  return (
    <tr>
      <td>{editing ? <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ padding: 6, border: "1px solid var(--line)", borderRadius: 6, width: "100%" }} /> : link.label}</td>
      <td>{editing ? <input value={url} onChange={(e) => setUrl(e.target.value)} style={{ padding: 6, border: "1px solid var(--line)", borderRadius: 6, width: "100%" }} /> : link.url}</td>
      <td style={{ display: "flex", gap: 4 }}>
        <button className="btn btn-sm btn-outline" onClick={onMoveUp} disabled={isFirst}>↑</button>
        <button className="btn btn-sm btn-outline" onClick={onMoveDown} disabled={isLast}>↓</button>
      </td>
      <td style={{ display: "flex", gap: 6 }}>
        {editing ? (
          <>
            <button className="btn btn-sm btn-primary" onClick={save}>Save</button>
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(link.id)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
