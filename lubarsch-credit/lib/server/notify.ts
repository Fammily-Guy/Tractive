import { site } from "@/config/site";
import { formatNaira } from "@/lib/format";
import { getEmailSender, staffInbox } from "./integrations/email";
import { getMessageSender } from "./integrations/messaging";
import type { ApplicationRecord, InboxItem } from "./types";

/** Notifications must never break the user's request — failures are logged only. */
async function safely(label: string, fn: () => Promise<void>) {
  try { await fn(); } catch (err) { console.error(`[notify] ${label} failed:`, (err as Error).message); }
}

export async function notifyApplicationReceived(app: ApplicationRecord) {
  const sender = getMessageSender();
  const a = app.applicant;
  const text = `Lubarsch Credit: Thank you ${a.fullName.split(" ")[0]}. We received your loan application. Ref: ${app.reference}. An officer will call you within 24 hours. We will NEVER ask for your PIN. Call ${site.phone}`;
  await Promise.all([
    a.consentContact ? safely("sms", () => sender.sendSms(a.phone, text)) : Promise.resolve(),
    a.consentContact ? safely("whatsapp", () => sender.sendWhatsApp(a.whatsapp || a.phone, text)) : Promise.resolve(),
    safely("staff email", () =>
      getEmailSender().send({
        to: staffInbox(),
        subject: `New application ${app.reference} — ${a.fullName} (${a.product}, ${formatNaira(a.amount)})`,
        text: [
          `Reference: ${app.reference}`,
          `Name: ${a.fullName}`,
          `Phone: ${a.phone}`,
          `Market: ${a.market === "other" ? a.marketOther : a.market} — ${a.stall}`,
          `Business: ${a.businessType}`,
          `Loan: ${a.product} ${a.tenor}, ${formatNaira(a.amount)} for ${a.purpose}`,
          `Agent code: ${a.agentCode || "-"}`,
          "",
          `Open the dashboard: ${site.url}/admin/applications/${app.id}`,
        ].join("\n"),
      }),
    ),
  ]);
}

export async function notifyStatusChange(app: ApplicationRecord) {
  if (!app.applicant.consentContact) return;
  const messages: Partial<Record<ApplicationRecord["status"], string>> = {
    under_review: "we are reviewing your application",
    visit_scheduled: "an officer will visit your shop soon. They will call before they come and will show their Lubarsch ID card",
    approved: "your loan is approved! An officer will call you about the next step",
    disbursed: "your loan has been sent to your bank account",
    declined: "we could not approve your loan this time. Please call us and we will explain",
  };
  const msg = messages[app.status];
  if (!msg) return;
  await safely("status sms", () =>
    getMessageSender().sendSms(app.applicant.phone, `Lubarsch Credit (${app.reference}): ${msg}. Call ${site.phone}`),
  );
}

export async function notifyInbox(item: InboxItem) {
  const titles = { callback: "Callback request", message: "Website message", investor: "Investor pack request", agent: "Agent sign-up" };
  await safely("inbox email", () =>
    getEmailSender().send({
      to: staffInbox(),
      subject: `${titles[item.kind]} — ${item.payload.name ?? ""}`,
      text: Object.entries(item.payload).map(([k, v]) => `${k}: ${v}`).join("\n"),
    }),
  );
}
