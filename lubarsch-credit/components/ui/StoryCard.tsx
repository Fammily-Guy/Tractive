import Image from "next/image";
import { Quote } from "lucide-react";
import type { Story } from "@/lib/content";
import { PlaceholderBadge } from "./PlaceholderBadge";

export function StoryCard({ story, placeholderLabel, usedForLabel }: { story: Story; placeholderLabel: string; usedForLabel?: string }) {
  return (
    <article className="card flex flex-col overflow-hidden p-0 sm:p-0">
      <div className="relative aspect-[4/3] bg-sand">
        <Image src={story.image} alt={story.imageAlt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
        {story.placeholder && <span className="absolute top-3 left-3"><PlaceholderBadge label={placeholderLabel} /></span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Quote className="h-6 w-6 text-gold" aria-hidden="true" />
        <blockquote className="mt-2 flex-1 text-lg font-semibold">“{story.quote}”</blockquote>
        {usedForLabel && <p className="mt-3 text-base text-ink-soft"><strong>{usedForLabel}:</strong> {story.usedFor}</p>}
        <p className="mt-4 font-extrabold text-brand">{story.name}</p>
        <p className="text-base text-ink-soft">{story.trade} — {story.market}</p>
      </div>
    </article>
  );
}
