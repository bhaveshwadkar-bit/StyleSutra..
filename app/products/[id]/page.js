import { supabase } from "@/lib/supabaseClient";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 0;

export default async function ProductPage({ params }) {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) {
    return <div className="container empty-state">Product not found.</div>;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", params.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const { data: settings } = await supabase.from("settings").select("low_stock_threshold").eq("id", 1).single();

  return (
    <ProductDetailClient
      product={product}
      initialReviews={reviews || []}
      lowStockThreshold={settings?.low_stock_threshold ?? 5}
    />
  );
}
