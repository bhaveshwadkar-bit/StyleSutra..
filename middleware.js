import { NextResponse } from "next/server";

// Paths that must NEVER be gated, no matter what — this is what guarantees
// the admin can always get in to turn the gate off, even mid-launch-lockdown.
const ALWAYS_ALLOWED_PREFIXES = ["/admin", "/api", "/_next", "/coming-soon"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }
  // Skip static files (images, favicon, etc.)
  if (/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|txt|xml|json)$/.test(pathname)) {
    return NextResponse.next();
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/settings?id=eq.1&select=launch_gate_enabled,launch_at,maintenance_mode_enabled`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      // Never let a stale cached response keep the gate open (or closed) longer than intended.
      cache: "no-store"
    });

    if (!res.ok) return NextResponse.next(); // fail open — a Supabase hiccup should never take down a live store

    const rows = await res.json();
    const settings = rows?.[0];
    if (!settings) return NextResponse.next();

    const isMaintenance = settings.maintenance_mode_enabled === true;
    const launchTimePassed = settings.launch_at ? new Date(settings.launch_at).getTime() <= Date.now() : false;
    const isLaunchGate = settings.launch_gate_enabled === true && !launchTimePassed;

    if (isMaintenance || isLaunchGate) {
      return NextResponse.rewrite(new URL("/coming-soon", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Any unexpected error (network, parsing, etc.) — fail open rather than accidentally
    // locking out real customers on a live store due to a gating bug.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
