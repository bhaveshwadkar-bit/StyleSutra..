import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

async function getData() {
  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return { sections: sections || [], products: products || [] };
}

export default async function HomePage() {
  const { sections, products } = await getData();

  return (
    <main>
      <section className="hero">
        <h1>Style Sutra</h1>
        <p>Handpicked chains, rings, charms & full chains — for him and her.</p>
      </section>

      <div className="container">
        {sections.length === 0 && (
          <div className="empty-state">No sections yet. Add some from the admin panel.</div>
        )}

        {sections.map((section) => {
          const sectionProducts = products.filter((p) => p.section_id === section.id);
          if (sectionProducts.length === 0) return null;
          return (
            <section key={section.id}>
              <div className="section-title">
                <h2>{section.name}</h2>
                <Link href={`/sections/${section.slug}`}>View all →</Link>
              </div>
              <div className="product-grid">
                {sectionProducts.slice(0, 8).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
