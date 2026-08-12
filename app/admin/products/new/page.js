import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  await requireAdminPage();
  const { data: sections } = await supabaseAdmin.from("sections").select("*").order("sort_order");

  return (
    <AdminShell title="Add Product">
      <ProductForm sections={sections || []} />
    </AdminShell>
  );
}
