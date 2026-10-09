import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { site } from "@/config/site";
import { getDictionary } from "@/lib/i18n";
import { locales, type Locale } from "@/lib/i18n-config";
import { getPost, listPosts } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { CtaBand } from "@/components/ui/CtaBand";
import { AdireDivider } from "@/components/ui/AdireDivider";

export async function generateStaticParams() {
  const posts = await listPosts();
  return locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
    alternates: { canonical: `${site.url}/blog/${slug}` },
    openGraph: { title: post.meta.title, description: post.meta.excerpt, type: "article", images: ["/og.jpg"] },
    robots: post.meta.draft ? { index: false } : undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const t = getDictionary(locale);
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <>
      <article className="container-page section mx-auto max-w-3xl">
        <Link href="/blog" className="btn-ghost -ml-4"><ArrowLeft className="h-5 w-5" aria-hidden="true" />{t.blog.back}</Link>
        <p className="mt-6 text-sm font-bold tracking-wider text-gold-dark uppercase">
          {t.blog.categories[post.meta.category]} {post.meta.date && `· ${formatDate(post.meta.date)}`}
        </p>
        <h1 className="h1 mt-2 text-brand-dark">{post.meta.title}</h1>
        {post.meta.draft && <div className="mt-3"><PlaceholderBadge label={t.blog.draft} /></div>}
        <AdireDivider className="my-6" />
        {/* Content comes from our own markdown files in /content/blog */}
        <div className="prose-lc" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <CtaBand t={t} />
    </>
  );
}
