import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";
import PromoBar from "@/components/PromoBar";

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

  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();

  const { data: promoMessages } = await supabase
    .from("promo_messages")
    .select("*")
    .order("sort_order");

  return {
    sections: sections || [],
    products: products || [],
    settings,
    promoMessages: promoMessages || [],
    lowStockThreshold: settings?.low_stock_threshold ?? 5
  };
}

export default async function HomePage() {
  const { sections, products, settings, promoMessages, lowStockThreshold } = await getData();

  const topLevelSections = sections.filter((s) => !s.parent_id);
  const newArrivals = products.slice(0, 10);
  const featured = products.filter((p) => p.is_featured);
  const bestSellers = products.filter((p) => p.is_best_seller);

  const heroImage = settings?.hero_image_url;
  const heroTitle = settings?.hero_title || "Style Sutra";
  const heroSubtitle = settings?.hero_subtitle || "";
  const heroButtonText = settings?.hero_button_text || "Shop Now";
  const heroButtonLink = settings?.hero_button_link || "/";

  return (
    <main>
      <PromoBar messages={promoMessages} />

      {heroImage ? (
        <section className="hero-banner" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-banner-overlay">
            <h1>{heroTitle}</h1>
            {heroSubtitle && <p>{heroSubtitle}</p>}
            <Link href={heroButtonLink} className="btn btn-primary hero-banner-btn">{heroButtonText}</Link>
          </div>
        </section>
      ) : (
        <section className="hero">
          <h1>{heroTitle}</h1>
          {heroSubtitle && <p>{heroSubtitle}</p>}
        </section>
      )}

      <div className="container">
        {topLevelSections.length > 0 && (
          <section>
            <div className="section-title">
              <h2>Shop by Category</h2>
            </div>
            <div className="category-grid">
              {topLevelSections.map((s) => (
                <Link key={s.id} href={`/sections/${s.slug}`} className="category-tile">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.name} />
                  ) : (
                    <div className="category-tile-placeholder" />
                  )}
                  <div className="category-tile-label">
                    <span>{s.name}</span>
                    <span className="category-tile-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {newArrivals.length > 0 && (
          <section>
            <div className="section-title">
              <h2>New Arrivals</h2>
            </div>
            <div className="scroll-row">
              {newArrivals.map((p) => (
                <div className="scroll-row-item" key={p.id}>
                  <ProductCard product={p} lowStockThreshold={lowStockThreshold} />
                </div>
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section>
            <div className="section-title">
              <h2>✨ Featured</h2>
            </div>
            <div className="scroll-row">
              {featured.map((p) => (
                <div className="scroll-row-item" key={p.id}>
                  <ProductCard product={p} lowStockThreshold={lowStockThreshold} />
                </div>
              ))}
            </div>
          </section>
        )}

        {bestSellers.length > 0 && (
          <section>
            <div className="section-title">
              <h2>Most Loved</h2>
            </div>
            <div className="scroll-row">
              {bestSellers.map((p) => (
                <div className="scroll-row-item" key={p.id}>
                  <ProductCard product={p} lowStockThreshold={lowStockThreshold} />
                </div>
              ))}
            </div>
          </section>
        )}

        {sections.length === 0 && (
          <div className="empty-state">No sections yet. Add some from the admin panel.</div>
        )}
      </div>
    </main>
  );
}
