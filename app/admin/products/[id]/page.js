import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function EditProductPage({ params }) {
  await requireAdminPage();
  const { data: product } = await supabaseAdmin.from("products").select("*").eq("id", params.id).single();
  const { data: sections } = await supabaseAdmin.from("sections").select("*").order("sort_order");

  if (!product) {
    return <AdminShell title="Product not found"><p>This product doesn't exist.</p></AdminShell>;
  }

  return (
    <AdminShell title={`Edit: ${product.name}`}>
      <ProductForm sections={sections || []} initialProduct={product} />
    </AdminShell>
  );
}
