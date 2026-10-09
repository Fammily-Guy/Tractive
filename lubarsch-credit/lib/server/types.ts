import type { Quote } from "@/lib/calculator";
import type { ApplicationInput } from "@/lib/validation";

export const APPLICATION_STATUSES = ["received", "under_review", "visit_scheduled", "approved", "disbursed", "declined"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type StaffRole = "admin" | "officer" | "viewer";

/** What we store. BVN and ID number are only ever stored encrypted. */
export type StoredApplicant = Omit<ApplicationInput, "bvn" | "idNumber" | "photo"> & {
  bvnLast4: string;
  idNumberLast4: string;
};

export interface StatusChange {
  at: string;
  by: string;
  from: ApplicationStatus | null;
  to: ApplicationStatus;
  note?: string;
}

export interface Note {
  at: string;
  by: string;
  text: string;
}

export interface ApplicationRecord {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  applicant: StoredApplicant;
  bvnEnc: string;
  idNumberEnc: string;
  quote: Quote | null;
  assignedOfficer: string | null;
  documents: string[];
  notes: Note[];
  history: StatusChange[];
  locale: string;
}

export type InboxKind = "callback" | "message" | "investor" | "agent";

export interface InboxItem {
  id: string;
  kind: InboxKind;
  createdAt: string;
  handled: boolean;
  payload: Record<string, string>;
}

export interface ApplicationFilter {
  status?: string;
  product?: string;
  market?: string;
  officer?: string;
  q?: string;
  from?: string; // ISO date
  to?: string;
}

export interface NewApplication {
  applicant: StoredApplicant;
  bvnEnc: string;
  idNumberEnc: string;
  quote: Quote | null;
  locale: string;
  photo?: { dataUrl: string } | null;
}

export interface Repository {
  createApplication(input: NewApplication): Promise<ApplicationRecord>;
  getApplication(id: string): Promise<ApplicationRecord | null>;
  findByReference(reference: string): Promise<ApplicationRecord | null>;
  listApplications(filter?: ApplicationFilter): Promise<ApplicationRecord[]>;
  updateApplication(
    id: string,
    change: { status?: ApplicationStatus; assignedOfficer?: string | null; note?: string },
    actor: string,
  ): Promise<ApplicationRecord | null>;
  getDocument(appId: string, docId: string): Promise<{ contentType: string; data: Buffer } | null>;
  createInboxItem(kind: InboxKind, payload: Record<string, string>): Promise<InboxItem>;
  listInbox(kind: InboxKind): Promise<InboxItem[]>;
  setInboxHandled(kind: InboxKind, id: string, handled: boolean): Promise<void>;
}
