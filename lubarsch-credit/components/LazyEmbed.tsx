"use client";

import { useState } from "react";
import { MapPin, Play } from "lucide-react";

/** Loads an iframe (map or video) only when the person taps — saves data on slow networks. */
export function LazyEmbed({ src, title, buttonLabel, note, kind, poster }: {
  src: string | null; title: string; buttonLabel: string; note?: string; kind: "map" | "video"; poster?: string;
}) {
  const [open, setOpen] = useState(false);
  if (open && src) {
    return (
      <iframe
        src={src}
        title={title}
        className="aspect-video w-full rounded-[var(--radius-card)] border-0"
        loading="lazy"
        allow={kind === "video" ? "encrypted-media; picture-in-picture" : undefined}
        allowFullScreen={kind === "video"}
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }
  const Icon = kind === "map" ? MapPin : Play;
  return (
    <div
      className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-card)] bg-sand bg-cover bg-center p-4 text-center"
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
    >
      <div className="absolute inset-0 bg-ink/30" aria-hidden="true" />
      <button type="button" onClick={() => setOpen(true)} disabled={!src} className="btn-primary relative text-lg disabled:opacity-90">
        <Icon className="h-6 w-6" aria-hidden="true" />{buttonLabel}
      </button>
      {note && <p className="relative rounded-full bg-white/90 px-3 py-1 text-sm font-semibold">{note}</p>}
    </div>
  );
}
