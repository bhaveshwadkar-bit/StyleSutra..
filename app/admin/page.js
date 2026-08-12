import { requireAdminPage } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminShell from "@/components/AdminShell";
import { formatINR } from "@/lib/format";

export const revalidate = 0;

export default async function AdminDashboard() {
  await requireAdminPage();

  const { data: orders } = await supabaseAdmin.from("orders").select("status, total");
  const { count: productCount } = await supabaseAdmin.from("products").select("*", { count: "exact", head: true });
  const { count: reviewCount } = await supabaseAdmin.from("reviews").select("*", { count: "exact", head: true });

  const all = orders || [];
  const pending = all.filter((o) => o.status === "pending_payment").length;
  const claimed = all.filter((o) => o.status === "payment_claimed").length;
  const confirmedRevenue = all
    .filter((o) => ["confirmed", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0);

  const stats = [
    { label: "Total Orders", value: all.length },
    { label: "Awaiting Payment", value: pending },
    { label: "Payment Claimed (verify these)", value: claimed },
    { label: "Confirmed Revenue", value: formatINR(confirmedRevenue) },
    { label: "Products Listed", value: productCount || 0 },
    { label: "Customer Reviews", value: reviewCount || 0 }
  ];

  return (
    <AdminShell title="Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {stats.map((s) => (
          <div className="card" key={s.label}>
            <p className="hint" style={{ margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, margin: "6px 0 0" }}>{s.value}</p>
          </div>
        ))}
      </div>
      {claimed > 0 && (
        <p style={{ marginTop: 20 }}>
          You have <strong>{claimed}</strong> order(s) marked "payment claimed" by customers —
          verify the payment in your bank/UPI app, then confirm them from the{" "}
          <a href="/admin/orders" style={{ color: "var(--rose-gold-dark)", fontWeight: 600 }}>Orders</a> page.
        </p>
      )}
    </AdminShell>
  );
}
