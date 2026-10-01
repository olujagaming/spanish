/** The Hablemos mark: a compass rose framed by an open fan (abanico). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d48f" />
          <stop offset="1" stopColor="#c98d34" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#bm-gold)" strokeWidth="2.5" />
      <path d="M32 7 37 27 57 32 37 37 32 57 27 37 7 32 27 27Z" fill="url(#bm-gold)" />
      <path d="M32 18 34.5 29.5 46 32 34.5 34.5 32 46 29.5 34.5 18 32 29.5 29.5Z" fill="#0b0e1a" opacity=".55" />
      <circle cx="32" cy="32" r="3.2" fill="#e2725b" />
    </svg>
  );
}
