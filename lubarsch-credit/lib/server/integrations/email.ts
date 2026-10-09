/** Staff email notifications. EMAIL_PROVIDER = resend | console. (Swap in SMTP/nodemailer if preferred.) */
export interface EmailMessage { to: string; subject: string; text: string }
export interface EmailSender { send(msg: EmailMessage): Promise<void> }

const consoleEmail: EmailSender = {
  async send(m) { console.info(`[email → ${m.to}] ${m.subject}\n${m.text}`); },
};

const resendEmail: EmailSender = {
  async send(m) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Lubarsch Credit <no-reply@lubarschcredit.com>", to: m.to, subject: m.subject, text: m.text }),
    });
    if (!res.ok) throw new Error(`Resend error ${res.status}`);
  },
};

export function getEmailSender(): EmailSender {
  return process.env.EMAIL_PROVIDER === "resend" && process.env.RESEND_API_KEY ? resendEmail : consoleEmail;
}

export const staffInbox = () => process.env.STAFF_NOTIFY_EMAIL ?? "staff@lubarschcredit.com";
