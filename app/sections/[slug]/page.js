import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function SectionPage({ params }) {
  const { data: section } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!section) {
    return <div className="container empty-state">Section not found.</div>;
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("section_id", section.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: subcategories } = await supabase
    .from("sections")
    .select("*")
    .eq("parent_id", section.id)
    .order("sort_order");

  const { data: settings } = await supabase.from("settings").select("low_stock_threshold").eq("id", 1).single();

  return (
    <main className="container" style={{ padding: "40px 20px" }}>
      <h1 className="font-display" style={{ marginBottom: 12 }}>{section.name}</h1>

      {subcategories && subcategories.length > 0 && (
        <div className="subcategory-chips">
          {subcategories.map((sub) => (
            <Link key={sub.id} href={`/sections/${sub.slug}`} className="subcategory-chip">
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {(!products || products.length === 0) ? (
        <div className="empty-state">No products in this category yet.</div>
      ) : (
        <div className="product-grid" style={{ marginTop: 20 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} lowStockThreshold={settings?.low_stock_threshold ?? 5} />
          ))}
        </div>
      )}
    </main>
  );
}
