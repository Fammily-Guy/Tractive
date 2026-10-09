import { markets } from "@/lib/content";
import { APPLICATION_STATUSES, type ApplicationFilter } from "./types";

/** Only allow known values through to the repository. */
export function cleanFilter(sp: Record<string, string | undefined>): ApplicationFilter {
  const f: ApplicationFilter = {};
  if (sp.status && (APPLICATION_STATUSES as readonly string[]).includes(sp.status)) f.status = sp.status;
  if (sp.product === "daily" || sp.product === "weekly") f.product = sp.product;
  if (sp.market && (sp.market === "other" || markets.some((m) => m.id === sp.market))) f.market = sp.market;
  if (sp.officer) f.officer = sp.officer.slice(0, 120);
  if (sp.q) f.q = sp.q.slice(0, 80);
  if (sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)) f.from = sp.from;
  if (sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to)) f.to = sp.to;
  return f;
}

