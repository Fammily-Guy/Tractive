import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: "business-tips" | "money-management" | "customer-stories" | "company-news";
  excerpt: string;
  draft: boolean;
  readingMinutes: number;
}

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const LEGAL_DIR = path.join(process.cwd(), "content/legal");

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? ""),
    category: (data.category as PostMeta["category"]) ?? "business-tips",
    excerpt: String(data.excerpt ?? ""),
    draft: data.draft === true,
    readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
  };
}

export async function listPosts(): Promise<PostMeta[]> {
  const files = (await fs.readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (f) => {
      const { data, content } = matter(await fs.readFile(path.join(BLOG_DIR, f), "utf8"));
      return toMeta(f.replace(/\.md$/, ""), data, content);
    }),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<{ meta: PostMeta; html: string } | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const { data, content } = matter(await fs.readFile(path.join(BLOG_DIR, `${slug}.md`), "utf8"));
    return { meta: toMeta(slug, data, content), html: await marked.parse(content) };
  } catch {
    return null;
  }
}

export async function getLegal(name: "privacy" | "terms" | "fair-collection") {
  const { data, content } = matter(await fs.readFile(path.join(LEGAL_DIR, `${name}.md`), "utf8"));
  return { title: String(data.title), updated: data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : String(data.updated ?? ""), html: await marked.parse(content) };
}
