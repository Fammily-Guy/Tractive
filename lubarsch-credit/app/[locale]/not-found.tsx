import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default function NotFound() {
  const t = getDictionary("en");
  return (
    <div className="container-page section text-center">
      <h1 className="h1 text-brand-dark">{t.notFound.title}</h1>
      <p className="lead mt-3">{t.notFound.text}</p>
      <Link href="/" className="btn-primary mt-6">{t.notFound.home}</Link>
    </div>
  );
}
