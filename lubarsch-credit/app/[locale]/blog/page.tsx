import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-config";
import { pageMetadata } from "@/lib/seo";
import { listPosts } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return pageMetadata(locale, "blog", "/blog");
}

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const posts = await listPosts();
  const categories = Object.entries(t.blog.categories).filter(([k]) => k !== "all");
  return (
    <>
      <PageHeader title={t.blog.title} sub={t.blog.sub} />
      <section className="container-page section">
        {categories.map(([key, label]) => {
          const inCat = posts.filter((p) => p.category === key);
          if (!inCat.length) return null;
          return (
            <div key={key} className="mb-12">
              <h2 className="h2">{label}</h2>
              <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {inCat.map((p) => (
                  <li key={p.slug} className="card flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                      <BookOpen className="h-4 w-4 text-brand" aria-hidden="true" />{p.readingMinutes} {t.blog.minRead}
                      {p.date && <>· {formatDate(p.date)}</>}
                      {p.draft && <PlaceholderBadge label={t.blog.draft} />}
                    </div>
                    <h3 className="h3 mt-2">{p.title}</h3>
                    <p className="mt-2 flex-1 text-ink-soft">{p.excerpt}</p>
                    <Link href={`/blog/${p.slug}`} className="btn-outline mt-4 self-start">{t.blog.read}<span className="sr-only">: {p.title}</span></Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </>
  );
}
