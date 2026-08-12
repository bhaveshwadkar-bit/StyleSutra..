// Simple admin session check used by every protected admin API route.
import { cookies } from "next/headers";

export function isAdminAuthed() {
  const cookieStore = cookies();
  const session = cookieStore.get("stylesutra_admin")?.value;
  return session === process.env.ADMIN_SESSION_SECRET;
}

export function requireAdmin() {
  if (!isAdminAuthed()) {
    return new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  return null; // null = ok, continue
}

// Server-component helper: call at the top of every protected admin page.
export async function requireAdminPage() {
  const { redirect } = await import("next/navigation");
  if (!isAdminAuthed()) {
    redirect("/admin/login");
  }
}
