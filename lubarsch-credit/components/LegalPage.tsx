import { AlertTriangle } from "lucide-react";
import { getLegal } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import type { Dict } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";

export async function LegalPage({ name, t }: { name: "privacy" | "terms" | "fair-collection"; t: Dict }) {
  const doc = await getLegal(name);
  return (
    <>
      <PageHeader title={doc.title} sub={doc.updated ? `${t.legal.updated}: ${formatDate(doc.updated)}` : undefined} />
      <section className="container-page section mx-auto max-w-3xl">
        <p className="mb-8 flex items-center gap-2 rounded-xl border-2 border-dashed border-danger bg-danger-light p-4 font-extrabold text-danger">
          <AlertTriangle className="h-6 w-6 shrink-0" aria-hidden="true" />{t.common.draftLegal}
        </p>
        <div className="prose-lc" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </section>
    </>
  );
}
