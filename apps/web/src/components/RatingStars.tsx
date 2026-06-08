export function RatingStars({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  const pct = Math.max(0, Math.min(5, rating)) * 20;
  return (
    <span
      className="relative inline-block leading-none"
      aria-label={`${rating.toFixed(1)} / 5`}
    >
      <span className="text-border-strong" style={{ fontSize: size }}>
        {"★★★★★"}
      </span>
      <span
        className="absolute inset-0 overflow-hidden text-brand-accent"
        style={{ fontSize: size, width: `${pct}%` }}
      >
        {"★★★★★"}
      </span>
    </span>
  );
}
