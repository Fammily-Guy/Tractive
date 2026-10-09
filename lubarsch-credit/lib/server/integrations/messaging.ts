/**
 * SMS / WhatsApp notifications. Pick a provider with MESSAGING_PROVIDER = termii | twilio | console.
 * Nothing is sent until keys are added — "console" just logs.
 */
export interface MessageSender {
  sendSms(to: string, text: string): Promise<void>;
  sendWhatsApp(to: string, text: string): Promise<void>;
}

const consoleSender: MessageSender = {
  async sendSms(to, text) { console.info(`[sms → ${to}] ${text}`); },
  async sendWhatsApp(to, text) { console.info(`[whatsapp → ${to}] ${text}`); },
};

const termiiSender: MessageSender = {
  async sendSms(to, text) {
    await post("https://api.ng.termii.com/api/sms/send", {
      api_key: process.env.TERMII_API_KEY, to: to.replace("+", ""), from: process.env.TERMII_SENDER_ID ?? "Lubarsch",
      sms: text, type: "plain", channel: "generic",
    });
  },
  async sendWhatsApp(to, text) {
    await post("https://api.ng.termii.com/api/sms/send", {
      api_key: process.env.TERMII_API_KEY, to: to.replace("+", ""), from: process.env.TERMII_SENDER_ID ?? "Lubarsch",
      sms: text, type: "plain", channel: "whatsapp",
    });
  },
};

const twilioSender: MessageSender = {
  async sendSms(to, text) { await twilio({ To: to, From: process.env.TWILIO_FROM_NUMBER ?? "", Body: text }); },
  async sendWhatsApp(to, text) { await twilio({ To: `whatsapp:${to}`, From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM ?? ""}`, Body: text }); },
};

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Messaging provider error ${res.status}`);
}

async function twilio(params: Record<string, string>) {
  const sid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN ?? ""}`).toString("base64")}` },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new Error(`Twilio error ${res.status}`);
}

export function getMessageSender(): MessageSender {
  switch (process.env.MESSAGING_PROVIDER) {
    case "termii": return process.env.TERMII_API_KEY ? termiiSender : consoleSender;
    case "twilio": return process.env.TWILIO_ACCOUNT_SID ? twilioSender : consoleSender;
    default: return consoleSender;
  }
}
