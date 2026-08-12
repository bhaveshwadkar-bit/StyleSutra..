import AdminSidebar from "@/components/AdminSidebar";

export default function AdminShell({ title, action, children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-content">
        <div className="admin-topbar">
          <h1 className="font-display" style={{ margin: 0, fontSize: 24 }}>{title}</h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
