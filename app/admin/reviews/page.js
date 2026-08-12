import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import ReviewsManager from "@/components/admin/ReviewsManager";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  await requireAdminPage();
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  return (
    <AdminShell title="Customer Reviews">
      <ReviewsManager initialReviews={reviews || []} />
    </AdminShell>
  );
}
