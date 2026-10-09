import Link from "next/link";
import { Download, Search } from "lucide-react";
import { getRepository } from "@/lib/server/repository";
import { APPLICATION_STATUSES } from "@/lib/server/types";
import { officers, requireStaff } from "@/lib/server/auth";
import { markets } from "@/lib/content";
import { formatDate, formatNaira } from "@/lib/format";
import { cleanFilter } from "@/lib/server/filters";

type SP = Record<string, string | undefined>;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireStaff();
  const sp = await searchParams;
  const filter = cleanFilter(sp);
  const apps = await getRepository().listApplications(filter);
  const qs = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]).toString();
  const select = "input min-h-11 py-2 text-base";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Applications <span className="text-ink-soft">({apps.length})</span></h1>
        <a href={`/admin/export?${qs}`} className="btn-outline min-h-11 py-2 text-sm"><Download className="h-4 w-4" aria-hidden="true" />Export CSV (Excel)</a>
      </div>
      <form className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="sr-only" htmlFor="q">Search</label>
          <div className="relative"><Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
            <input id="q" name="q" defaultValue={filter.q} placeholder="Name, phone or reference" className={`${select} pl-10`} /></div>
        </div>
        <select name="status" defaultValue={filter.status ?? ""} className={select} aria-label="Status"><option value="">All statuses</option>{APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
        <select name="product" defaultValue={filter.product ?? ""} className={select} aria-label="Product"><option value="">All products</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select>
        <select name="market" defaultValue={filter.market ?? ""} className={select} aria-label="Market"><option value="">All markets</option>{markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}<option value="other">Other</option></select>
        <select name="officer" defaultValue={filter.officer ?? ""} className={select} aria-label="Officer"><option value="">All officers</option><option value="unassigned">Unassigned</option>{officers().map((o) => <option key={o.email} value={o.email}>{o.name}</option>)}</select>
        <label className="text-sm font-semibold">From<input type="date" name="from" defaultValue={filter.from} className={select} /></label>
        <label className="text-sm font-semibold">To<input type="date" name="to" defaultValue={filter.to} className={select} /></label>
        <div className="flex items-end gap-2 sm:col-span-2">
          <button className="btn-primary min-h-11 py-2">Filter</button>
          <Link href="/admin/applications" className="btn-ghost min-h-11 py-2">Clear</Link>
        </div>
      </form>
      <div className="overflow-x-auto rounded-xl bg-white shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-brand text-white"><tr>{["Reference", "Date", "Name", "Phone", "Market", "Product", "Amount", "Status", "Officer"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {apps.map((a) => (
              <tr key={a.id} className="hover:bg-cream">
                <td className="p-3 font-mono font-bold"><Link className="text-brand underline" href={`/admin/applications/${a.id}`}>{a.reference}</Link></td>
                <td className="p-3">{formatDate(a.createdAt)}</td>
                <td className="p-3">{a.applicant.fullName}</td>
                <td className="p-3">{a.applicant.phone}</td>
                <td className="p-3">{a.applicant.market === "other" ? a.applicant.marketOther : markets.find((m) => m.id === a.applicant.market)?.name}</td>
                <td className="p-3 capitalize">{a.applicant.product} · {a.applicant.tenor}</td>
                <td className="p-3">{formatNaira(a.applicant.amount)}</td>
                <td className="p-3"><span className="rounded-full bg-brand-light px-2 py-0.5 font-semibold capitalize">{a.status.replace("_", " ")}</span></td>
                <td className="p-3">{a.assignedOfficer ?? "—"}</td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-ink-soft">No applications match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
