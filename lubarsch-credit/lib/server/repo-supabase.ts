/**
 * Supabase (Postgres) repository using the PostgREST HTTP API — no extra SDK needed.
 * Schema and Row Level Security: /supabase/schema.sql.
 * Uses the service-role key, so it must only ever run on the server.
 */
import { randomUUID } from "node:crypto";
import type {
  ApplicationFilter, ApplicationRecord, ApplicationStatus, InboxItem, InboxKind, NewApplication, Repository,
} from "./types";
import { applyFilter } from "./repo-shared";

const URL_ = process.env.SUPABASE_URL ?? "";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET ?? "application-documents";

async function rest<T>(pathAndQuery: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${URL_}/rest/v1/${pathAndQuery}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

type Row = {
  id: string; reference: string; created_at: string; updated_at: string; status: ApplicationStatus;
  applicant: ApplicationRecord["applicant"]; bvn_enc: string; id_number_enc: string; quote: ApplicationRecord["quote"];
  assigned_officer: string | null; documents: string[]; notes: ApplicationRecord["notes"]; history: ApplicationRecord["history"]; locale: string;
};

const fromRow = (r: Row): ApplicationRecord => ({
  id: r.id, reference: r.reference, createdAt: r.created_at, updatedAt: r.updated_at, status: r.status,
  applicant: r.applicant, bvnEnc: r.bvn_enc, idNumberEnc: r.id_number_enc, quote: r.quote,
  assignedOfficer: r.assigned_officer, documents: r.documents ?? [], notes: r.notes ?? [], history: r.history ?? [], locale: r.locale,
});

async function uploadDocument(appId: string, dataUrl: string): Promise<string | null> {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const docId = `${randomUUID()}.${m[1].split("/")[1]}`;
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${appId}/${docId}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": m[1] },
    body: Buffer.from(m[2], "base64"),
  });
  return res.ok ? docId : null;
}

export const supabaseRepository: Repository = {
  async createApplication(input: NewApplication) {
    // reference is generated in Postgres (see next_application_reference() in schema.sql)
    const [row] = await rest<Row[]>("applications", {
      method: "POST",
      body: JSON.stringify({
        status: "received",
        applicant: input.applicant,
        bvn_enc: input.bvnEnc,
        id_number_enc: input.idNumberEnc,
        quote: input.quote,
        locale: input.locale,
        documents: [],
        notes: [],
        history: [{ at: new Date().toISOString(), by: "system", from: null, to: "received" }],
      }),
    });
    if (input.photo?.dataUrl) {
      const docId = await uploadDocument(row.id, input.photo.dataUrl);
      if (docId) {
        await rest(`applications?id=eq.${row.id}`, { method: "PATCH", body: JSON.stringify({ documents: [docId] }) });
        row.documents = [docId];
      }
    }
    return fromRow(row);
  },

  async getApplication(id) {
    const rows = await rest<Row[]>(`applications?id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows[0] ? fromRow(rows[0]) : null;
  },

  async findByReference(reference) {
    const rows = await rest<Row[]>(`applications?reference=eq.${encodeURIComponent(reference.trim().toUpperCase())}&limit=1`);
    return rows[0] ? fromRow(rows[0]) : null;
  },

  async listApplications(filter: ApplicationFilter = {}) {
    // Server-side filters for the indexed columns; the rest is applied in memory.
    const params = new URLSearchParams({ order: "created_at.desc", limit: "2000" });
    if (filter.status) params.set("status", `eq.${filter.status}`);
    const rows = await rest<Row[]>(`applications?${params}`);
    return applyFilter(rows.map(fromRow), filter);
  },

  async updateApplication(id, change, actor) {
    const app = await this.getApplication(id);
    if (!app) return null;
    const now = new Date().toISOString();
    const patch: Partial<Row> = { updated_at: now };
    if (change.status && change.status !== app.status) {
      patch.status = change.status;
      patch.history = [...app.history, { at: now, by: actor, from: app.status, to: change.status, note: change.note }];
    } else if (change.note) {
      patch.notes = [...app.notes, { at: now, by: actor, text: change.note }];
    }
    if (change.assignedOfficer !== undefined) patch.assigned_officer = change.assignedOfficer || null;
    const [row] = await rest<Row[]>(`applications?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    return row ? fromRow(row) : null;
  },

  async getDocument(appId, docId) {
    if (!/^[\w-]+\.(jpeg|png|webp)$/.test(docId) || !/^[\w-]+$/.test(appId)) return null;
    const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${appId}/${docId}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    if (!res.ok) return null;
    return { contentType: res.headers.get("content-type") ?? "image/jpeg", data: Buffer.from(await res.arrayBuffer()) };
  },

  async createInboxItem(kind: InboxKind, payload) {
    const [row] = await rest<{ id: string; kind: InboxKind; created_at: string; handled: boolean; payload: Record<string, string> }[]>("inbox", {
      method: "POST",
      body: JSON.stringify({ kind, payload, handled: false }),
    });
    return { id: row.id, kind: row.kind, createdAt: row.created_at, handled: row.handled, payload: row.payload } satisfies InboxItem;
  },

  async listInbox(kind) {
    const rows = await rest<{ id: string; kind: InboxKind; created_at: string; handled: boolean; payload: Record<string, string> }[]>(
      `inbox?kind=eq.${kind}&order=created_at.desc&limit=1000`,
    );
    return rows.map((r) => ({ id: r.id, kind: r.kind, createdAt: r.created_at, handled: r.handled, payload: r.payload }));
  },

  async setInboxHandled(kind, id, handled) {
    await rest(`inbox?kind=eq.${kind}&id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ handled }) });
  },
};
