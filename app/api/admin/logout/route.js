export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", "stylesutra_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return res;
}
