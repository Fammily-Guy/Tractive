import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { stories } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { StoryCard } from "@/components/ui/StoryCard";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "stories", "/stories");
}

export default async function StoriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.stories.title} sub={t.stories.sub} />
      <section className="container-page section">
        {stories.length === 0 ? (
          <p className="lead">{t.stories.empty}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => <StoryCard key={s.id} story={s} placeholderLabel={t.common.placeholder} usedForLabel={t.stories.usedFor} />)}
          </div>
        )}
      </section>
      <CtaBand t={t} />
    </>
  );
}
