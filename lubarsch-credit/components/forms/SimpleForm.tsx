"use client";

import { useState } from "react";
import { CircleCheck, Send } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { postJson } from "@/lib/api";
import type { ErrorKey } from "@/lib/validation";
import { Honeypot, RadioGroup, SelectField, TextArea, TextField } from "./Fields";
import { Turnstile } from "./Turnstile";

export type SimpleField =
  | { name: string; type: "text" | "tel" | "email"; label: string; required?: boolean; autoComplete?: string }
  | { name: string; type: "textarea"; label: string; required?: boolean }
  | { name: string; type: "select"; label: string; options: { value: string; label: string }[]; required?: boolean }
  | { name: string; type: "radio"; label: string; options: { value: string; label: string }[]; columns?: 1 | 2 | 3; required?: boolean };

/** Small forms (callback, contact, investor pack, agent sign-up) that post to /api/forms/<kind>. */
export function SimpleForm({ kind, fields, submitLabel, successText, initial = {} }: {
  kind: "callback" | "message" | "investor" | "agent";
  fields: SimpleField[];
  submitLabel: string;
  successText: string;
  initial?: Record<string, string>;
}) {
  const { dict: t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<Record<string, ErrorKey | undefined>>({});
  const [state, setState] = useState<"idle" | "busy" | "done" | "error" | "limited">("idle");
  const [honeypot, setHoneypot] = useState("");
  const [token, setToken] = useState("");

  const set = (k: string) => (v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const err = (k: string) => (errors[k] ? t.errors[errors[k]!] : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing: Record<string, ErrorKey> = {};
    for (const f of fields) if (f.required && !values[f.name]?.trim()) missing[f.name] = f.type === "radio" || f.type === "select" ? "choose" : "required";
    if (Object.keys(missing).length) return setErrors(missing);
    setState("busy");
    try {
      const res = await postJson(`/api/forms/${kind}`, { ...values, website: honeypot, turnstileToken: token });
      const body = res.body as Record<string, any>;
      if (res.ok) setState("done");
      else if (res.status === 422 && body.fields) { setErrors(body.fields); setState("idle"); }
      else setState(res.status === 429 ? "limited" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-brand-light p-5 text-lg font-bold text-brand-dark" role="status">
        <CircleCheck className="h-7 w-7 shrink-0 text-success" aria-hidden="true" />{successText}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Honeypot value={honeypot} onValue={setHoneypot} />
      {fields.map((f) => {
        const label = f.required ? f.label : `${f.label} (${t.common.optional})`;
        if (f.type === "textarea") return <TextArea key={f.name} name={f.name} label={label} value={values[f.name] ?? ""} onValue={set(f.name)} error={err(f.name)} />;
        if (f.type === "select") return <SelectField key={f.name} name={f.name} label={label} placeholder="—" options={f.options} value={values[f.name] ?? ""} onValue={set(f.name)} error={err(f.name)} />;
        if (f.type === "radio") return <RadioGroup key={f.name} name={f.name} legend={label} options={f.options} columns={f.columns ?? 1} value={values[f.name] ?? ""} onValue={set(f.name)} error={err(f.name)} />;
        return (
          <TextField key={f.name} name={f.name} label={label} type={f.type} inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
            autoComplete={f.autoComplete ?? (f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined)}
            value={values[f.name] ?? ""} onValue={set(f.name)} error={err(f.name)} />
        );
      })}
      <Turnstile onToken={setToken} />
      {(state === "error" || state === "limited") && (
        <p className="rounded-xl bg-danger-light p-3 font-semibold text-danger" role="alert">{state === "limited" ? t.errors.tooMany : t.common.somethingWrong}</p>
      )}
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={state === "busy"}>
        <Send className="h-5 w-5" aria-hidden="true" />{state === "busy" ? t.common.sending : submitLabel}
      </button>
    </form>
  );
}
