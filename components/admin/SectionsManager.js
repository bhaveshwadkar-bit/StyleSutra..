"use client";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function SectionsManager({ initialSections }) {
  const [sections, setSections] = useState(initialSections);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const topLevel = sections.filter((s) => !s.parent_id);
  const childrenOf = (id) => sections.filter((s) => s.parent_id === id);

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadToCloudinary(file, { maxMB: 10, resourceType: "image" });
      setNewImageUrl(result.url);
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function addSection(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          sort_order: sections.length + 1,
          parent_id: newParentId || null,
          image_url: newImageUrl || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSections((prev) => [...prev, data.section]);
      setNewName("");
      setNewParentId("");
      setNewImageUrl("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function updateSection(id, fields) {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
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
        <div className="field">
          <label>Category Photo (shown as a tile on your homepage — top-level categories only)</label>
          <div className="upload-grid">
            {newImageUrl && (
              <div className="upload-thumb">
                <img src={newImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" className="remove-btn" onClick={() => setNewImageUrl("")}>×</button>
              </div>
            )}
            <label className="upload-tile">
              {uploading ? "…" : "+ Add photo"}
              <input type="file" accept="image/*" hidden onChange={handleImageSelect} disabled={uploading} />
            </label>
          </div>
        </div>
        <p className="hint">
          Leave "Parent Category" empty to create a main category (like "Charms"). Choose a parent to
          create a subcategory under it (like "Enamel Charms" under "Charms").
        </p>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>Add</button>
      </form>

      {topLevel.map((section) => (
        <div key={section.id} className="card" style={{ marginBottom: 14 }}>
          <SectionRow section={section} onUpdate={updateSection} onDelete={deleteSection} isParent />
          {childrenOf(section.id).length > 0 && (
            <div style={{ marginLeft: 22, marginTop: 8, borderLeft: "2px solid var(--line)", paddingLeft: 14 }}>
              {childrenOf(section.id).map((child) => (
                <SectionRow key={child.id} section={child} onUpdate={updateSection} onDelete={deleteSection} />
              ))}
            </div>
          )}
        </div>
      ))}
      {topLevel.length === 0 && <p className="hint">No categories yet — add one above.</p>}
    </div>
  );
}

function SectionRow({ section, onUpdate, onDelete, isParent }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name);
  const [imageUrl, setImageUrl] = useState(section.image_url || "");
  const [uploading, setUploading] = useState(false);

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, { maxMB: 10, resourceType: "image" });
      setImageUrl(result.url);
    } catch (err) {
      alert(err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  function save() {
    onUpdate(section.id, { name, image_url: imageUrl || null, sort_order: section.sort_order, parent_id: section.parent_id });
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
        <div className="field" style={{ marginBottom: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 6, border: "1px solid var(--line)", borderRadius: 6, width: "100%" }} />
        </div>
        {isParent && (
          <div className="upload-grid" style={{ marginBottom: 8 }}>
            {imageUrl && (
              <div className="upload-thumb">
                <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" className="remove-btn" onClick={() => setImageUrl("")}>×</button>
              </div>
            )}
            <label className="upload-tile">
              {uploading ? "…" : imageUrl ? "Replace" : "+ Add photo"}
              <input type="file" accept="image/*" hidden onChange={handleImageSelect} disabled={uploading} />
            </label>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={save}>Save</button>
          <button className="btn btn-sm btn-outline" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {isParent && (
          section.image_url ? (
            <img src={section.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--cream-dark)" }} />
          )
        )}
        <span style={{ fontWeight: isParent ? 700 : 500 }}>{section.name}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button className="btn btn-sm btn-outline" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(section.id)}>Delete</button>
      </div>
    </div>
  );
}
