/** Lightweight adire-inspired geometric divider (pure SVG pattern, ~0.5KB). */
export function AdireDivider({ className = "", tone = "gold" }: { className?: string; tone?: "gold" | "brand" | "cream" }) {
  const color = tone === "gold" ? "var(--color-gold)" : tone === "brand" ? "var(--color-brand)" : "var(--color-cream)";
  const id = `adire-${tone}`;
  return (
    <div className={`h-6 w-full ${className}`} aria-hidden="true">
      <svg width="100%" height="24" preserveAspectRatio="none">
        <defs>
          <pattern id={id} width="32" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 12 L8 4 L16 12 L8 20 Z" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="24" cy="12" r="2.5" fill={color} />
            <path d="M16 12 h16" stroke={color} strokeWidth="1" strokeDasharray="2 3" />
          </pattern>
        </defs>
        <rect width="100%" height="24" fill={`url(#${id})`} opacity="0.7" />
      </svg>
    </div>
  );
}

/** Faint repeating pattern for section backgrounds. */
export function AdireBackground({ className = "" }: { className?: string }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <pattern id="adire-bg" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M28 4 L52 28 L28 52 L4 28 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="28" cy="28" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="2" fill="currentColor" />
          <circle cx="56" cy="56" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#adire-bg)" />
    </svg>
  );
}
