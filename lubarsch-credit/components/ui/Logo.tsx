export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="var(--color-brand)" />
      <path d="M6 40 L12 34 L18 40 L24 34 L30 40 L36 34 L42 40" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 10 v20 h16" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="14" r="4" fill="var(--color-gold)" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="leading-none">
        <span className="block text-lg font-extrabold text-brand">Lubarsch</span>{" "}
        <span className="block text-xs font-bold tracking-[0.2em] text-gold-dark uppercase">Credit</span>
      </span>
    </span>
  );
}
