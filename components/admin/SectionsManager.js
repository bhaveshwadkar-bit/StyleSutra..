"use client";
import { useState } from "react";

export default function SectionsManager({ initialSections }) {
  const [sections, setSections] = useState(initialSections);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const topLevel = sections.filter((s) => !s.parent_id);
  const childrenOf = (id) => sections.filter((s) => s.parent_id === id);

  async function addSection(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, sort_order: sections.length + 1, parent_id: newParentId || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSections((prev) => [...prev, data.section]);
      setNewName("");
      setNewParentId("");
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
    if (res.ok) setSections((prev) => prev.map((s) => (s.id === id ? data.section : s)));
  }

  async function deleteSection(id) {
    if (!confirm("Delete this category? Any subcategories under it will also be deleted, and products in it will become uncategorized.")) return;
    const res = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    if (res.ok) setSections((prev) => prev.filter((s) => s.id !== id && s.parent_id !== id));
  }

  return (
    <div>
      <form className="card" onSubmit={addSection} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Add Category or Subcategory</h3>
        <div className="field-row">
          <div className="field">
            <label>Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Enamel Charms" />
          </div>
          <div className="field">
            <label>Parent Category (optional)</label>
            <select value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
              <option value="">— Top-level category —</option>
              {topLevel.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="hint">
          Leave "Parent Category" empty to create a main category (like "Charms"). Choose a parent to
          create a subcategory under it (like "Enamel Charms" under "Charms") — matching how you saw it
          on the reference site.
        </p>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>Add</button>
      </form>

      {topLevel.map((section) => (
        <div key={section.id} className="card" style={{ marginBottom: 14 }}>
          <SectionRow section={section} onRename={renameSection} onDelete={deleteSection} isParent />
          {childrenOf(section.id).length > 0 && (
            <div style={{ marginLeft: 22, marginTop: 8, borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
              {childrenOf(section.id).map((child) => (
                <SectionRow key={child.id} section={child} onRename={renameSection} onDelete={deleteSection} />
              ))}
            </div>
          )}
        </div>
      ))}
      {topLevel.length === 0 && <p className="hint">No categories yet — add one above.</p>}
    </div>
  );
}

function SectionRow({ section, onRename, onDelete, isParent }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
      {editing ? (
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 6, border: "1px solid var(--line)", borderRadius: 6, flex: 1, marginRight: 10 }} />
      ) : (
        <span style={{ fontWeight: isParent ? 700 : 500 }}>{section.name}</span>
      )}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
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
      </div>
    </div>
  );
}
