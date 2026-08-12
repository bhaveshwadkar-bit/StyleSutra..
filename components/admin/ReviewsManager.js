"use client";
import { useState } from "react";
import StarRating from "@/components/StarRating";

export default function ReviewsManager({ initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);

  async function toggleApproval(r) {
    const res = await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: !r.is_approved })
    });
    const data = await res.json();
    if (res.ok) setReviews((prev) => prev.map((x) => (x.id === r.id ? data.review : x)));
  }

  async function deleteReview(id) {
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (reviews.length === 0) {
    return <div className="empty-state">No reviews yet.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {reviews.map((r) => (
        <div className="card" key={r.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <strong>{r.customer_name}</strong>
              <span className="hint" style={{ marginLeft: 10 }}>on {r.products?.name || "a product"}</span>
              <div style={{ marginTop: 4 }}><StarRating value={r.rating} /></div>
            </div>
            <span className={`badge ${r.is_approved ? "badge-confirmed" : "badge-cancelled"}`}>
              {r.is_approved ? "Visible" : "Hidden"}
            </span>
          </div>
          <p style={{ margin: "10px 0" }}>{r.message}</p>
          {r.photos?.length > 0 && (
            <div className="upload-grid">
              {r.photos.map((url, i) => (
                <div className="upload-thumb" key={i}><img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-sm btn-outline" onClick={() => toggleApproval(r)}>
              {r.is_approved ? "Hide from site" : "Make visible"}
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => deleteReview(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
