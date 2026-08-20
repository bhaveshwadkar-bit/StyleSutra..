"use client";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function ProductCard({ product, lowStockThreshold = 5 }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const photo = product.photos?.[0]?.url;
  const outOfStock = product.stock != null && product.stock <= 0;
  const lowStock = !outOfStock && product.stock != null && product.stock <= lowStockThreshold;

  function quickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <div style={{ position: "relative" }}>
        {photo ? (
          <img className="thumb" src={photo} alt={product.name} />
        ) : (
          <div className="thumb" />
        )}
        {outOfStock && <span className="out-of-stock-badge">Out of Stock</span>}
        {!outOfStock && (
          <button className="quick-add-btn" onClick={quickAdd} aria-label="Add to cart">
            {added ? "✓" : "🛍"}
          </button>
        )}
      </div>
      <div className="body">
        <p className="name">{product.name}</p>
        <p className="price">
          {formatINR(product.price)}
          {product.compare_at_price > product.price && (
            <span className="strike">{formatINR(product.compare_at_price)}</span>
          )}
        </p>
        {lowStock && <p className="stock-warning" style={{ margin: "4px 0 0" }}>Only {product.stock} left!</p>}
      </div>
    </Link>
  );
}
