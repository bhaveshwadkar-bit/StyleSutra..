"use client";
import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";

export default function ProductsManager({ initialProducts, sections }) {
  const [search, setSearch] = useState("");
  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s.name]));

  const filtered = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1.5px solid var(--line)", flex: 1, maxWidth: 320 }}
        />
      </div>
      <table className="admin-table">
        <thead>
          <tr><th>Photo</th><th>Name</th><th>Section</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.photos?.[0]?.url ? <img src={p.photos[0].url} alt="" /> : "—"}</td>
              <td>{p.name}</td>
              <td>{sectionMap[p.section_id] || "—"}</td>
              <td>{formatINR(p.price)}</td>
              <td>{p.stock}</td>
              <td>
                <span className={`badge ${p.is_active ? "badge-confirmed" : "badge-cancelled"}`}>
                  {p.is_active ? "Visible" : "Hidden"}
                </span>
              </td>
              <td><Link href={`/admin/products/${p.id}`} className="btn btn-sm btn-outline">Edit</Link></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} className="hint" style={{ padding: 20 }}>No products found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
