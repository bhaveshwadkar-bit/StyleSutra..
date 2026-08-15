"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/menu", label: "Site Menu (☰)" },
  { href: "/admin/coupons", label: "Coupon Codes" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Support & Payment Settings" }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 20, marginBottom: 20 }}>
        Style Sutra <span style={{ opacity: 0.6, fontSize: 13 }}>Admin</span>
      </div>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
          {l.label}
        </Link>
      ))}
      <button className="btn btn-outline btn-sm" style={{ marginTop: 20, color: "#fff", borderColor: "rgba(255,255,255,0.3)" }} onClick={logout}>
        Log out
      </button>
    </aside>
  );
}
