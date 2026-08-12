import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const body = await request.json();
  const { product_id, customer_name, rating, message, photos } = body;

  if (!product_id || !customer_name || !rating) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (photos && photos.length > 5) {
    return Response.json({ error: "Max 5 photos allowed" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      product_id,
      customer_name: customer_name.trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      message: (message || "").trim(),
      photos: photos || [],
      is_approved: true
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ review: data });
}
