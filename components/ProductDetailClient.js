"use client";
import { useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import StarRating from "@/components/StarRating";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ProductDetailClient({ product, initialReviews, lowStockThreshold = 5 }) {
  const { addItem } = useCart();
  const media = [
    ...(product.photos || []).map((m) => ({ ...m, type: "image" })),
    ...(product.videos || []).map((m) => ({ ...m, type: "video" }))
  ];
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [reviews, setReviews] = useState(initialReviews);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  const active = media[activeIdx];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const inStock = product.stock == null || product.stock > 0;
  const lowStock = product.stock != null && product.stock > 0 && product.stock <= lowStockThreshold;

  function goTo(idx) {
    if (media.length === 0) return;
    setActiveIdx((idx + media.length) % media.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(activeIdx + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  function handleAdd() {
    addItem(product, qty);
    setToast(`Added ${qty} × ${product.name} to cart`);
    setTimeout(() => setToast(""), 2200);
  }

  return (
    <main className="container" style={{ padding: "32px 20px 0" }}>
      <div className="product-detail">
        <div>
          <div
            className="gallery-main"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {active?.type === "video" ? (
              <video key={active.url} src={active.url} controls autoPlay muted loop playsInline />
            ) : active ? (
              <img key={active.url} src={active.url} alt={product.name} onClick={() => setLightboxOpen(true)} style={{ cursor: "zoom-in" }} />
            ) : (
              <div style={{ width: "100%", height: "100%" }} />
            )}
            {!inStock && <span className="out-of-stock-badge">Out of Stock</span>}
            {media.length > 1 && (
              <>
                <button className="gallery-nav-btn prev" onClick={() => goTo(activeIdx - 1)} aria-label="Previous">‹</button>
                <button className="gallery-nav-btn next" onClick={() => goTo(activeIdx + 1)} aria-label="Next">›</button>
              </>
            )}
          </div>
          {media.length > 1 && (
            <div className="gallery-dots">
              {media.map((_, i) => (
                <span key={i} className={i === activeIdx ? "active" : ""} />
              ))}
            </div>
          )}
          {media.length > 1 && (
            <div className="gallery-thumbs">
              {media.map((m, i) => (
                <button
                  key={i}
                  className={`thumb-btn ${i === activeIdx ? "active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                >
                  {m.type === "video" ? <video src={m.url} muted playsInline /> : <img src={m.url} alt="" />}
                </button>
              ))}
            </div>
          )}
          {active?.type !== "video" && (
            <p className="hint" style={{ textAlign: "center", marginTop: 6 }}>Tap photo to view full size</p>
          )}
        </div>

        <div>
          <h1 className="font-display" style={{ fontSize: 30, margin: "0 0 8px" }}>
            {product.name}
          </h1>
          {reviews.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <StarRating value={avgRating} />
              <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                {avgRating.toFixed(1)} ({reviews.length} review{reviews.length > 1 ? "s" : ""})
              </span>
            </div>
          )}
          <p className="price" style={{ fontSize: 24, fontWeight: 700, color: "var(--rose-gold-dark)" }}>
            {formatINR(product.price)}
            {product.compare_at_price > product.price && (
              <>
                <span className="strike" style={{ marginLeft: 10 }}>
                  {formatINR(product.compare_at_price)}
                </span>
                <span className="percent-off-badge">
                  {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                </span>
              </>
            )}
          </p>
          <p style={{ color: "var(--text-muted)", whiteSpace: "pre-line" }}>{product.description}</p>

          {!inStock ? (
            <p className="stock-warning" style={{ margin: "18px 0" }}>Currently out of stock</p>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "18px 0" }}>
                <div className="qty-control">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                  Add to Cart
                </button>
              </div>
              {lowStock && <p className="stock-warning">Only {product.stock} left in stock!</p>}
            </>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} reviews={reviews} setReviews={setReviews} />

      {toast && <div className="toast">{toast}</div>}

      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="Close">×</button>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {active?.type === "video" ? (
              <video key={active.url} src={active.url} controls autoPlay playsInline />
            ) : (
              <img key={active.url} src={active.url} alt={product.name} />
            )}
            {media.length > 1 && (
              <>
                <button className="gallery-nav-btn prev" onClick={(e) => { e.stopPropagation(); goTo(activeIdx - 1); }} aria-label="Previous">‹</button>
                <button className="gallery-nav-btn next" onClick={(e) => { e.stopPropagation(); goTo(activeIdx + 1); }} aria-label="Next">›</button>
              </>
            )}
          </div>
          {media.length > 1 && (
            <div className="gallery-dots" style={{ marginTop: 14 }}>
              {media.map((_, i) => (
                <span key={i} className={i === activeIdx ? "active" : ""} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ReviewsSection({ productId, reviews, setReviews }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setError("Max 5 photos allowed.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const result = await uploadToCloudinary(file, { maxMB: 10, resourceType: "image" });
        setPhotos((prev) => [...prev, result.url]);
      }
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a short message.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, customer_name: name, rating, message, photos })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setReviews((prev) => [data.review, ...prev]);
      setName(""); setRating(5); setMessage(""); setPhotos([]);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  return (
    <section style={{ margin: "56px 0 64px" }}>
      <h2 className="font-display" style={{ marginBottom: 18 }}>Customer Reviews</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {reviews.length === 0 && <p className="hint">No reviews yet — be the first!</p>}
          {reviews.map((r) => (
            <div key={r.id} className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{r.customer_name}</strong>
                <StarRating value={r.rating} />
              </div>
              <p style={{ margin: "8px 0" }}>{r.message}</p>
              {r.photos?.length > 0 && (
                <div className="upload-grid">
                  {r.photos.map((url, i) => (
                    <div className="upload-thumb" key={i}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <form className="card" onSubmit={submitReview}>
          <h3 style={{ marginTop: 0 }}>Write a review</h3>
          <div className="field">
            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya S." />
          </div>
          <div className="field">
            <label>Rating</label>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= rating ? "filled" : ""} onClick={() => setRating(n)}>★</span>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Your review</label>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How was the quality, fit, delivery?" />
          </div>
          <div className="field">
            <label>Photos (up to 5)</label>
            <div className="upload-grid">
              {photos.map((url, i) => (
                <div className="upload-thumb" key={i}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" className="remove-btn" onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}>×</button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="upload-tile">
                  {uploading ? "Uploading…" : "+ Add photo"}
                  <input type="file" accept="image/*" multiple hidden onChange={handlePhotoSelect} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" disabled={submitting || uploading}>
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
}
