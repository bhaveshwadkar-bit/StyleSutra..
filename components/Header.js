"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import NavDrawer from "@/components/NavDrawer";

export default function Header({ siteName = "Style Sutra" }) {
  const { totalQty } = useCart();
  const [main, ...rest] = siteName.split(" ");
  return (
    <header className="site-header">
      <div className="inner container">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NavDrawer />
          <Link href="/" className="brand">
            {main} <span>{rest.join(" ")}</span>
          </Link>
        </div>
        <nav className="nav-links">
          <Link href="/">Shop</Link>
          <Link href="/track">Track Order</Link>
          <Link href="/support">Support</Link>
          <Link href="/cart" className="cart-pill">🛍 Cart ({totalQty})</Link>
        </nav>
      </div>
    </header>
  );
}
