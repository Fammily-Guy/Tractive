import type { Repository } from "./types";
import { fileRepository } from "./repo-file";
import { supabaseRepository } from "./repo-supabase";

/**
 * The one place that decides where data lives. Swap implementations here
 * (e.g. another Postgres host) without touching pages or API routes.
 */
export function getRepository(): Repository {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return supabaseRepository;
  return fileRepository;
}
