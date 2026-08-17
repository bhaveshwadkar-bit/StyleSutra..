import Link from "next/link";
import { formatINR } from "@/lib/format";

export default function ProductCard({ product }) {
  const photo = product.photos?.[0]?.url;
  return (
    <Link href={`/products/${product.id}`} className="product-card">
      {photo ? (
        <img className="thumb" src={photo} alt={product.name} />
      ) : (
        <div className="thumb" />
      )}
      <div className="body">
        <p className="name">{product.name}</p>
        <p className="price">
          {formatINR(product.price)}
          {product.compare_at_price > product.price && (
            <span className="strike">{formatINR(product.compare_at_price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
