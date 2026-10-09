/**
 * Local JSON-file repository — for development and small pilots.
 * Data lives in ./.data (git-ignored). On read-only hosts (e.g. Vercel without Supabase)
 * it falls back to memory, so use Supabase in production.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  ApplicationFilter, ApplicationRecord, InboxItem, InboxKind, NewApplication, Repository,
} from "./types";
import { applyFilter, formatReference } from "./repo-shared";

interface DB {
  seq: number;
  applications: ApplicationRecord[];
  inbox: InboxItem[];
}

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");
const DOCS = path.join(DIR, "documents");

let cache: DB | null = null;
let writable = true;
let queue: Promise<unknown> = Promise.resolve();
const memoryDocs = new Map<string, { contentType: string; data: Buffer }>();

async function load(): Promise<DB> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    cache = { seq: 0, applications: [], inbox: [] };
  }
  return cache;
}

async function persist() {
  if (!writable || !cache) return;
  try {
    await fs.mkdir(DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(cache, null, 2));
    await fs.rename(tmp, FILE);
  } catch (err) {
    writable = false;
    console.warn("[repo-file] storage is read-only — keeping data in memory only.", (err as Error).message);
  }
}

/** Serialise all writes so concurrent requests can't clobber each other. */
function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist();
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

function parseDataUrl(dataUrl: string): { contentType: string; data: Buffer } | null {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  return { contentType: m[1], data: Buffer.from(m[2], "base64") };
}

export const fileRepository: Repository = {
  createApplication: (input: NewApplication) =>
    mutate(async (db) => {
      db.seq += 1;
      const now = new Date().toISOString();
      const id = randomUUID();
      const documents: string[] = [];
      const doc = input.photo?.dataUrl ? parseDataUrl(input.photo.dataUrl) : null;
      if (doc) {
        const docId = `${randomUUID()}.${doc.contentType.split("/")[1]}`;
        try {
          if (!writable) throw new Error("read-only");
          await fs.mkdir(path.join(DOCS, id), { recursive: true });
          await fs.writeFile(path.join(DOCS, id, docId), doc.data);
        } catch {
          memoryDocs.set(`${id}/${docId}`, doc);
        }
        documents.push(docId);
      }
      const record: ApplicationRecord = {
        id,
        reference: formatReference(new Date().getFullYear(), db.seq),
        createdAt: now,
        updatedAt: now,
        status: "received",
        applicant: input.applicant,
        bvnEnc: input.bvnEnc,
        idNumberEnc: input.idNumberEnc,
        quote: input.quote,
        assignedOfficer: null,
        documents,
        notes: [],
        history: [{ at: now, by: "system", from: null, to: "received" }],
        locale: input.locale,
      };
      db.applications.push(record);
      return record;
    }),

  async getApplication(id) {
    const db = await load();
    return db.applications.find((a) => a.id === id) ?? null;
  },

  async findByReference(reference) {
    const db = await load();
    const ref = reference.trim().toUpperCase();
    return db.applications.find((a) => a.reference === ref) ?? null;
  },

  async listApplications(filter: ApplicationFilter = {}) {
    const db = await load();
    return applyFilter(db.applications, filter);
  },

  updateApplication: (id, change, actor) =>
    mutate((db) => {
      const app = db.applications.find((a) => a.id === id);
      if (!app) return null;
      const now = new Date().toISOString();
      if (change.status && change.status !== app.status) {
        app.history.push({ at: now, by: actor, from: app.status, to: change.status, note: change.note });
        app.status = change.status;
      } else if (change.note) {
        app.notes.push({ at: now, by: actor, text: change.note });
      }
      if (change.assignedOfficer !== undefined) app.assignedOfficer = change.assignedOfficer || null;
      app.updatedAt = now;
      return app;
    }),

  async getDocument(appId, docId) {
    if (!/^[\w-]+\.(jpeg|png|webp)$/.test(docId) || !/^[\w-]+$/.test(appId)) return null;
    const mem = memoryDocs.get(`${appId}/${docId}`);
    if (mem) return mem;
    try {
      const data = await fs.readFile(path.join(DOCS, appId, docId));
      return { contentType: `image/${docId.split(".").pop()}`, data };
    } catch {
      return null;
    }
  },

  createInboxItem: (kind: InboxKind, payload) =>
    mutate((db) => {
      const item: InboxItem = { id: randomUUID(), kind, createdAt: new Date().toISOString(), handled: false, payload };
      db.inbox.push(item);
      return item;
    }),

  async listInbox(kind) {
    const db = await load();
    return db.inbox.filter((i) => i.kind === kind).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  setInboxHandled: (kind, id, handled) =>
    mutate((db) => {
      const item = db.inbox.find((i) => i.kind === kind && i.id === id);
      if (item) item.handled = handled;
    }),
};
