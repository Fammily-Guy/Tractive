import type { ApplicationFilter, ApplicationRecord } from "./types";

/** LBC-2026-000123 */
export function formatReference(year: number, seq: number): string {
  return `LBC-${year}-${String(seq).padStart(6, "0")}`;
}

export function applyFilter(apps: ApplicationRecord[], f: ApplicationFilter): ApplicationRecord[] {
  const q = f.q?.trim().toLowerCase();
  const digits = q?.replace(/\D/g, "");
  return apps
    .filter((a) => !f.status || a.status === f.status)
    .filter((a) => !f.product || a.applicant.product === f.product)
    .filter((a) => !f.market || a.applicant.market === f.market)
    .filter((a) => !f.officer || (f.officer === "unassigned" ? !a.assignedOfficer : a.assignedOfficer === f.officer))
    .filter((a) => !f.from || a.createdAt >= f.from)
    .filter((a) => !f.to || a.createdAt.slice(0, 10) <= f.to)
    .filter((a) => {
      if (!q) return true;
      return (
        a.applicant.fullName.toLowerCase().includes(q) ||
        a.reference.toLowerCase().includes(q) ||
        (!!digits && digits.length >= 4 && a.applicant.phone.replace(/\D/g, "").includes(digits.replace(/^0/, "")))
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
