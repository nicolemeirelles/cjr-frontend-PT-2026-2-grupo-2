"use client";
import { useState } from "react";

type Props = { value: number; onChange: (nota: number) => void };

export default function StarRating({ value, onChange }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div role="radiogroup" aria-label="Nota" className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} de 5 estrelas`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          <svg
            viewBox="0 0 24 24"
            width="52"
            height="52"
            fill={n <= (hover || value) ? "#6d3cf0" : "none"}
            stroke="#6d3cf0"
            strokeWidth="0.6"
            strokeLinejoin="round"
          >
            <path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.6 6 20.9l1.3-6.7-5-4.7 6.8-.8z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
