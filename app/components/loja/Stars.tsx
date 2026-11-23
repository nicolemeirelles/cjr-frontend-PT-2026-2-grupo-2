const STAR_PATH =
  "M12 2.5l2.94 6.06 6.56.83-4.8 4.6 1.2 6.51L12 17.33 6.1 20.5l1.2-6.51-4.8-4.6 6.56-.83L12 2.5Z";

function StarRow({ size }: { size: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <svg
          key={index}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </>
  );
}

export default function Stars({
  rating,
  size = 24,
}: {
  rating: number;
  size?: number;
}) {
  const percent = (Math.min(Math.max(rating, 0), 5) / 5) * 100;
  const label = rating.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return (
    <span className="store-stars" role="img" aria-label={`Nota ${label} de 5`}>
      <span className="store-stars-empty">
        <StarRow size={size} />
      </span>
      <span className="store-stars-filled" style={{ width: `${percent}%` }}>
        <StarRow size={size} />
      </span>
    </span>
  );
}
