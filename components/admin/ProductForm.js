"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUploader from "@/components/admin/MediaUploader";

export default function ProductForm({ sections, initialProduct }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || "");
  const [sectionId, setSectionId] = useState(initialProduct?.section_id || (sections[0]?.id ?? ""));
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [price, setPrice] = useState(initialProduct?.price || "");
  const [compareAtPrice, setCompareAtPrice] = useState(initialProduct?.compare_at_price || "");
  const [stock, setStock] = useState(initialProduct?.stock ?? 100);
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [photos, setPhotos] = useState(initialProduct?.photos || []);
  const [videos, setVideos] = useState(initialProduct?.videos || []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (photos.length === 0) {
      setError("Add at least 1 photo.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name, section_id: sectionId || null, description,
      price: Number(price), compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock), is_active: isActive, photos, videos
    };
    try {
      const url = isEdit ? `/api/admin/products/${initialProduct.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${initialProduct.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${initialProduct.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      <div className="field">
        <label>Product Name *</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rose Gold Curb Chain" />
      </div>

      <div className="field">
        <label>Section</label>
        <select value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">— No section —</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Description</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Material, size, care instructions…" />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Price (₹) *</label>
          <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="field">
          <label>Compare-at Price (₹) — optional, shows strikethrough</label>
          <input type="number" min="0" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Stock Quantity</label>
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="field">
          <label>Visibility</label>
          <select value={isActive ? "active" : "hidden"} onChange={(e) => setIsActive(e.target.value === "active")}>
            <option value="active">Visible on site</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      <MediaUploader photos={photos} setPhotos={setPhotos} videos={videos} setVideos={setVideos} />

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        {isEdit && (
          <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete Product</button>
        )}
      </div>
    </form>
  );
}
