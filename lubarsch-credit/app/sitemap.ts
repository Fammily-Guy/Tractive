import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { listPosts } from "@/lib/markdown";

export const dynamic = "force-static";

const pages = [
  "", "/loans", "/loans/daily", "/loans/weekly", "/calculator", "/apply", "/how-it-works", "/about", "/branches",
  "/investors", "/stories", "/blog", "/faqs", "/contact", "/become-an-agent", "/legal/privacy", "/legal/terms", "/legal/fair-collection",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await listPosts()).filter((p) => !p.draft);
  return [
    ...pages.map((p) => ({
      url: `${site.url}${p}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p.startsWith("/loans") || p === "/apply" ? 0.9 : 0.6,
      alternates: { languages: { yo: `${site.url}/yo${p}`, pcm: `${site.url}/pcm${p}` } },
    })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: 0.5 })),
  ];
}
