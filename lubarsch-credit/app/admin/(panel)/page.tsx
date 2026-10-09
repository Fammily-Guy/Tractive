import Link from "next/link";
import { getRepository } from "@/lib/server/repository";
import { APPLICATION_STATUSES } from "@/lib/server/types";
import { markets } from "@/lib/content";
import { formatNaira } from "@/lib/format";
import { requireStaff } from "@/lib/server/auth";

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  await requireStaff();
  const { denied } = await searchParams;
  const repo = getRepository();
  const apps = await repo.listApplications();
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const thisWeek = apps.filter((a) => a.createdAt >= weekAgo);
  const decided = apps.filter((a) => ["approved", "disbursed", "declined"].includes(a.status));
  const approved = apps.filter((a) => ["approved", "disbursed"].includes(a.status));
  const conversion = decided.length ? Math.round((approved.length / decided.length) * 100) : null;
  const [callbacks] = await Promise.all([repo.listInbox("callback")]);

  const count = <T extends string>(keys: readonly T[], get: (a: (typeof apps)[number]) => string) =>
    keys.map((k) => ({ key: k, n: apps.filter((a) => get(a) === k).length }));

  const byProduct = count(["daily", "weekly"] as const, (a) => a.applicant.product);
  const byMarket = count(markets.map((m) => m.id), (a) => a.applicant.market).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const byStatus = count(APPLICATION_STATUSES, (a) => a.status);
  const max = (xs: { n: number }[]) => Math.max(1, ...xs.map((x) => x.n));

  return (
    <div className="space-y-6">
      {denied && <p className="rounded-lg bg-danger-light p-3 font-semibold text-danger">You don&apos;t have permission for that page.</p>}
      <h1 className="text-2xl font-extrabold">Overview</h1>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Applications this week", thisWeek.length],
          ["Total applications", apps.length],
          ["Approval rate (decided)", conversion === null ? "—" : `${conversion}%`],
          ["Open callbacks", callbacks.filter((c) => !c.handled).length],
        ].map(([label, value]) => (
          <div key={label as string} className="card"><dt className="text-sm font-semibold text-ink-soft">{label}</dt><dd className="mt-1 text-3xl font-extrabold text-brand">{value}</dd></div>
        ))}
      </dl>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: "By status", rows: byStatus.map((x) => ({ label: x.key.replace("_", " "), n: x.n, href: `/admin/applications?status=${x.key}` })) },
          { title: "By product", rows: byProduct.map((x) => ({ label: x.key, n: x.n, href: `/admin/applications?product=${x.key}` })) },
          { title: "By market", rows: byMarket.map((x) => ({ label: markets.find((m) => m.id === x.key)?.name ?? x.key, n: x.n, href: `/admin/applications?market=${x.key}` })) },
        ].map((block) => (
          <section key={block.title} className="card">
            <h2 className="font-extrabold">{block.title}</h2>
            {block.rows.length === 0 && <p className="mt-2 text-sm text-ink-soft">No data yet.</p>}
            <ul className="mt-3 space-y-2">
              {block.rows.map((r) => (
                <li key={r.label}>
                  <Link href={r.href} className="block hover:underline">
                    <span className="flex justify-between text-sm font-semibold capitalize"><span>{r.label}</span><span>{r.n}</span></span>
                    <span className="mt-1 block h-2 rounded-full bg-brand-light"><span className="block h-2 rounded-full bg-brand" style={{ width: `${(r.n / max(block.rows)) * 100}%` }} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="card">
        <h2 className="font-extrabold">Latest applications</h2>
        <ul className="mt-3 divide-y divide-line">
          {apps.slice(0, 5).map((a) => (
            <li key={a.id}><Link href={`/admin/applications/${a.id}`} className="flex justify-between gap-2 py-2 hover:underline"><span>{a.reference} · {a.applicant.fullName}</span><span className="text-ink-soft">{formatNaira(a.applicant.amount)} · {a.status.replace("_", " ")}</span></Link></li>
          ))}
          {apps.length === 0 && <li className="py-2 text-sm text-ink-soft">No applications yet.</li>}
        </ul>
      </section>
    </div>
  );
}
