export function PlaceholderBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full border border-dashed border-gold-dark bg-gold-light px-2 py-0.5 text-xs font-bold text-gold-dark uppercase">
      {label}
    </span>
  );
}
