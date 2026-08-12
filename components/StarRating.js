export default function StarRating({ value = 0, size = 16 }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {"★".repeat(rounded)}
      {"☆".repeat(5 - rounded)}
    </span>
  );
}
