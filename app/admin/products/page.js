import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import ProductsManager from "@/components/admin/ProductsManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  await requireAdminPage();
  const { data: products } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  const { data: sections } = await supabaseAdmin.from("sections").select("*").order("sort_order");

  return (
    <AdminShell
      title="Products"
      action={<Link href="/admin/products/new" className="btn btn-primary">+ Add Product</Link>}
    >
      <ProductsManager initialProducts={products || []} sections={sections || []} />
    </AdminShell>
  );
}
