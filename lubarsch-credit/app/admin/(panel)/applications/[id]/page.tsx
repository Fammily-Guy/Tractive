import { Fragment } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Eye } from "lucide-react";
import { getRepository } from "@/lib/server/repository";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/server/types";
import { officers, requireStaff } from "@/lib/server/auth";
import { decrypt, mask } from "@/lib/server/crypto";
import { notifyStatusChange } from "@/lib/server/notify";
import { markets } from "@/lib/content";
import { formatNaira } from "@/lib/format";

async function update(formData: FormData) {
  "use server";
  const session = await requireStaff(["admin", "officer"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const officer = formData.get("officer");
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  const repo = getRepository();
  const before = await repo.getApplication(id);
  if (!before) notFound();
  const change: { status?: ApplicationStatus; assignedOfficer?: string | null; note?: string } = {};
  if ((APPLICATION_STATUSES as readonly string[]).includes(status) && status !== before.status) change.status = status as ApplicationStatus;
  if (officer !== null && session.role === "admin") {
    const o = String(officer);
    change.assignedOfficer = o && officers().some((x) => x.email === o) ? o : null;
  }
  if (note) change.note = note;
  const after = await repo.updateApplication(id, change, session.email);
  if (after && change.status) await notifyStatusChange(after);
  revalidatePath(`/admin/applications/${id}`);
  redirect(`/admin/applications/${id}?saved=1`);
}

export default async function ApplicationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ reveal?: string; saved?: string }> }) {
  const session = await requireStaff();
  const { id } = await params;
  const { reveal, saved } = await searchParams;
  const app = await getRepository().getApplication(id);
  if (!app) notFound();
  const a = app.applicant;
  const canReveal = session.role === "admin" && reveal === "1";
  const canEdit = session.role !== "viewer";
  if (canReveal) console.info(`[audit] ${session.email} revealed BVN/ID for ${app.reference}`);

  const sections: [string, [string, string | number][]][] = [
    ["Applicant", [["Name", a.fullName], ["Phone", a.phone], ["WhatsApp", a.whatsapp], ["Gender", a.gender], ["Date of birth", a.dob], ["Address", a.address], ["LGA", a.lga], ["Language", a.language]]],
    ["Business", [["Type", a.businessType], ["Market", a.market === "other" ? a.marketOther : markets.find((m) => m.id === a.market)?.name ?? a.market], ["Stall", a.stall], ["Years", a.years], ["Daily sales", a.dailySales]]],
    ["Loan", [["Product", `${a.product} · ${a.tenor}`], ["Amount", formatNaira(a.amount)], ["Purpose", a.purpose],
      ...(app.quote ? ([["Cash to customer", formatNaira(app.quote.cashReceived)], ["Instalment", `${formatNaira(app.quote.instalment)} × ${app.quote.numberOfPayments}`], ["Total repayable", formatNaira(app.quote.totalRepaid)]] as [string, string][]) : [])]],
    ["Identity & guarantor", [
      ["ID type", a.idType],
      ["ID number", canReveal ? decrypt(app.idNumberEnc) : mask(`xxxxxxx${a.idNumberLast4}`)],
      ["BVN", canReveal ? decrypt(app.bvnEnc) : mask(`xxxxxxx${a.bvnLast4}`)],
      ["Guarantor", a.guarantorName], ["Guarantor phone", a.guarantorPhone], ["Relationship", a.guarantorRelationship], ["Agent code", a.agentCode || "—"],
    ]],
    ["Consent", [["Terms", a.consentTerms ? "Yes" : "No"], ["Privacy (NDPA)", a.consentPrivacy ? "Yes" : "No"], ["Contact by SMS/WhatsApp", a.consentContact ? "Yes" : "No"]]],
  ];

  return (
    <div className="space-y-4">
      <Link href="/admin/applications" className="btn-ghost min-h-10 px-2 text-sm"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All applications</Link>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-mono text-2xl font-extrabold">{app.reference}</h1>
        <span className="rounded-full bg-brand-light px-3 py-1 font-bold capitalize">{app.status.replace("_", " ")}</span>
      </div>
      {saved && <p className="rounded-lg bg-brand-light p-3 font-semibold">Saved.</p>}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {sections.map(([title, rows]) => (
            <section key={title} className="card">
              <div className="flex items-center justify-between"><h2 className="font-extrabold">{title}</h2>
                {title.startsWith("Identity") && session.role === "admin" && !canReveal && (
                  <Link href={`?reveal=1`} className="btn-ghost min-h-10 px-2 text-sm"><Eye className="h-4 w-4" aria-hidden="true" />Reveal (logged)</Link>
                )}
              </div>
              <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[10rem_1fr]">
                {rows.map(([k, v]) => <Fragment key={k}><dt className="text-sm text-ink-soft">{k}</dt><dd className="font-semibold break-words">{v || "—"}</dd></Fragment>)}
              </dl>
            </section>
          ))}
          <section className="card">
            <h2 className="font-extrabold">Documents</h2>
            {app.documents.length === 0 ? <p className="text-sm text-ink-soft">No uploads.</p> : (
              <ul className="mt-2 flex flex-wrap gap-3">
                {app.documents.map((d) => (
                  <li key={d}><a href={`/admin/documents/${app.id}/${d}`} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/admin/documents/${app.id}/${d}`} alt="Uploaded ID or photo" className="h-32 w-32 rounded-lg border border-line object-cover" />
                  </a></li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          {canEdit && (
            <form action={update} className="card space-y-3">
              <h2 className="font-extrabold">Update</h2>
              <input type="hidden" name="id" value={app.id} />
              <label className="block text-sm font-semibold">Status
                <select name="status" defaultValue={app.status} className="input min-h-11 py-2 text-base">{APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
              </label>
              {session.role === "admin" && (
                <label className="block text-sm font-semibold">Assigned officer
                  <select name="officer" defaultValue={app.assignedOfficer ?? ""} className="input min-h-11 py-2 text-base"><option value="">Unassigned</option>{officers().map((o) => <option key={o.email} value={o.email}>{o.name}</option>)}</select>
                </label>
              )}
              <label className="block text-sm font-semibold">Note
                <textarea name="note" rows={3} className="input text-base" placeholder="Visit notes, call outcome…" />
              </label>
              <p className="text-xs text-ink-soft">Changing status sends the customer an SMS if they consented.</p>
              <button className="btn-primary min-h-11 w-full py-2">Save</button>
            </form>
          )}
          <section className="card">
            <h2 className="font-extrabold">History</h2>
            <ol className="mt-2 space-y-2 text-sm">
              {[...app.history.map((h) => ({ at: h.at, by: h.by, text: `${h.from ? h.from.replace("_", " ") + " → " : ""}${h.to.replace("_", " ")}${h.note ? ` — ${h.note}` : ""}` })),
                ...app.notes.map((n) => ({ at: n.at, by: n.by, text: `📝 ${n.text}` }))]
                .sort((x, y) => y.at.localeCompare(x.at))
                .map((e, i) => (
                  <li key={i} className="border-l-2 border-gold pl-3"><p className="font-semibold">{e.text}</p><p className="text-ink-soft">{new Date(e.at).toLocaleString("en-NG")} · {e.by}</p></li>
                ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
