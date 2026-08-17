import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ products: data });
}

export async function POST(request) {
  if (!isAdminAuthed()) return Response.json({ error: "Not authorized" }, { status: 401 });
  const body = await request.json();

  if ((body.photos || []).length > 5) return Response.json({ error: "Max 5 photos allowed" }, { status: 400 });
  if ((body.videos || []).length > 2) return Response.json({ error: "Max 2 videos allowed" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("products").insert({
    section_id: body.section_id || null,
    name: body.name,
    description: body.description || "",
    price: body.price,
    compare_at_price: body.compare_at_price || null,
    stock: body.stock ?? 100,
    is_active: body.is_active ?? true,
    photos: body.photos || [],
    videos: body.videos || []
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ product: data });
}
