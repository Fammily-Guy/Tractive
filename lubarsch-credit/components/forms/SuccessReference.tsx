"use client";

import { useSearchParams } from "next/navigation";

export function SuccessReference() {
  const ref = useSearchParams().get("ref");
  const safe = ref && /^LBC-\d{4}-\d{6}$/.test(ref) ? ref : "—";
  return <p className="mt-2 font-mono text-3xl font-extrabold tracking-wider text-brand sm:text-4xl" data-testid="reference">{safe}</p>;
}
