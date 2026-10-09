import { Fragment } from "react";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/server/repository";
import { requireStaff } from "@/lib/server/auth";
import type { InboxKind } from "@/lib/server/types";

const titles: Record<InboxKind, string> = { callback: "Callback requests", message: "Messages", investor: "Investor enquiries", agent: "Agent sign-ups" };

async function toggle(formData: FormData) {
  "use server";
  await requireStaff(["admin", "officer"]);
  const kind = String(formData.get("kind")) as InboxKind;
  if (!(kind in titles)) return;
  await getRepository().setInboxHandled(kind, String(formData.get("id")), formData.get("handled") === "true");
  revalidatePath(`/admin/inbox/${kind}`);
}

export default async function InboxPage({ params }: { params: Promise<{ kind: string }> }) {
  const session = await requireStaff();
  const { kind } = await params;
  if (!(kind in titles)) notFound();
  if (kind === "investor" && session.role === "viewer") notFound();
  const items = await getRepository().listInbox(kind as InboxKind);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{titles[kind as InboxKind]} <span className="text-ink-soft">({items.filter((i) => !i.handled).length} open)</span></h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className={`card p-4 ${item.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <dl className="grid flex-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[8rem_1fr]">
                <dt className="text-ink-soft">Received</dt><dd className="font-semibold">{new Date(item.createdAt).toLocaleString("en-NG")}</dd>
                {Object.entries(item.payload).map(([k, v]) => <Fragment key={k}><dt className="text-ink-soft capitalize">{k}</dt><dd className="font-semibold break-words">{k === "phone" && v ? <a className="text-brand underline" href={`tel:${v}`}>{v}</a> : v || "—"}</dd></Fragment>)}
              </dl>
              {session.role !== "viewer" && (
                <form action={toggle}>
                  <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="handled" value={String(!item.handled)} />
                  <button className={item.handled ? "btn-ghost min-h-10 py-1 text-sm" : "btn-primary min-h-10 py-1 text-sm"}>{item.handled ? "Re-open" : "Mark done"}</button>
                </form>
              )}
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="card text-ink-soft">Nothing here yet.</li>}
      </ul>
    </div>
  );
}
