"use client";
import { useEffect, useState } from "react";

export default function SectionsManager({ initialSections }) {
  const [sections, setSections] = useState(initialSections);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function addSection(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, sort_order: sections.length + 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSections((prev) => [...prev, data.section]);
      setNewName("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function renameSection(id, name) {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (res.ok) {
      setSections((prev) => prev.map((s) => (s.id === id ? data.section : s)));
    }
  }

  async function deleteSection(id) {
    if (!confirm("Delete this section? Products in it will become unsectioned.")) return;
    const res = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    if (res.ok) setSections((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <form className="card" onSubmit={addSection} style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <label>New Section Name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Bracelets" />
        </div>
        <button className="btn btn-primary" disabled={busy}>Add Section</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Slug</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <SectionRow key={s.id} section={s} onRename={renameSection} onDelete={deleteSection} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionRow({ section, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name);

  return (
    <tr>
      <td>
        {editing ? (
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 6, border: "1px solid var(--line)", borderRadius: 6 }} />
        ) : (
          section.name
        )}
      </td>
      <td>{section.slug}</td>
      <td style={{ display: "flex", gap: 8 }}>
        {editing ? (
          <>
            <button className="btn btn-sm btn-primary" onClick={() => { onRename(section.id, name); setEditing(false); }}>Save</button>
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(section.id)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
