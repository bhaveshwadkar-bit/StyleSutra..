import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FestivalBanner from "@/components/FestivalBanner";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Style Sutra — Chains, Rings & Charms",
  description: "Men's & women's accessories — chains, rings, charms and full chains."
};

async function getSettings() {
  try {
    const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
    return data;
  } catch (e) {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  // Purely date-driven — no manual action needed. Once festival_theme_end_at passes,
  // this becomes false on the very next page load and everything reverts automatically.
  const festivalActive =
    settings?.festival_theme_enabled === true &&
    settings?.festival_theme_end_at &&
    new Date() < new Date(settings.festival_theme_end_at);

  return (
    <html lang="en">
      <body className={festivalActive ? "festival-theme" : ""}>
        <CartProvider>
          {festivalActive && <FestivalBanner text={settings.festival_banner_text} endAt={settings.festival_theme_end_at} />}
          <Header siteName={settings?.site_name || "Style Sutra"} />
          {children}
          <Footer settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}
