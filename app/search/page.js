"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: "32px 20px 64px" }}><p className="hint">Loading…</p></main>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  useEffect(() => {
    supabase.from("settings").select("low_stock_threshold").eq("id", 1).single()
      .then(({ data }) => setLowStockThreshold(data?.low_stock_threshold ?? 5));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .ilike("name", `%${q.trim()}%`)
      .then(({ data }) => setResults(data || []));
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="container" style={{ padding: "32px 20px 64px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          autoFocus
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid var(--line)", fontSize: 15 }}
        />
        <button className="btn btn-primary">Search</button>
      </form>

      {results === null && <p className="hint">Type something and press search.</p>}
      {results && results.length === 0 && query.trim() && (
        <div className="empty-state">No products found for "{query}".</div>
      )}
      {results && results.length > 0 && (
        <div className="product-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} lowStockThreshold={lowStockThreshold} />
          ))}
        </div>
      )}
    </main>
  );
}
