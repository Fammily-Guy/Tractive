"use client";

import { AlertTriangle } from "lucide-react";
import { useId } from "react";

export function FieldError({ id, message }: { id: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} className="error" role="alert">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  hint?: string;
  error?: string | null;
  value: string;
  onValue: (v: string) => void;
  name: string;
};

export function TextField({ label, hint, error, value, onValue, name, ...rest }: InputProps) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        name={name}
        className="input"
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-field={name}
        {...rest}
      />
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function TextArea({ label, error, value, onValue, name, rows = 4 }: { label: string; error?: string | null; value: string; onValue: (v: string) => void; name: string; rows?: number }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <textarea id={id} name={name} rows={rows} className="input" value={value} onChange={(e) => onValue(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} data-field={name} />
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function SelectField({ label, hint, error, value, onValue, name, options, placeholder }: {
  label: string; hint?: string; error?: string | null; value: string; onValue: (v: string) => void; name: string;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} name={name} className="input" value={value} onChange={(e) => onValue(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined} data-field={name}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

export function RadioGroup({ legend, error, value, onValue, name, options, columns = 2 }: {
  legend: string; error?: string | null; value: string; onValue: (v: string) => void; name: string;
  options: { value: string; label: string; icon?: React.ReactNode }[]; columns?: 1 | 2 | 3 | 4;
}) {
  const id = useId();
  const cols = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[columns];
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined} data-field={name} tabIndex={-1}>
      <legend className="label">{legend}</legend>
      <div className={`grid gap-3 ${cols}`}>
        {options.map((o) => (
          <label key={o.value} className={`choice ${o.icon ? "flex-col justify-center py-4 text-center" : ""} ${error ? "border-danger" : ""}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onValue(o.value)} className="sr-only" />
            {o.icon}
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${id}-err`} message={error} />
    </fieldset>
  );
}

export function Checkbox({ label, checked, onChecked, error, name }: { label: React.ReactNode; checked: boolean; onChecked: (v: boolean) => void; error?: string | null; name: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-4 ${error ? "border-danger" : "border-line"}`}>
        <input id={id} name={name} type="checkbox" checked={checked} onChange={(e) => onChecked(e.target.checked)} className="mt-1 h-6 w-6 shrink-0 accent-[var(--color-brand)]" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} data-field={name} />
        <span className="text-base">{label}</span>
      </label>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

/** Invisible to people (and screen readers); bots tend to fill it in. */
export function Honeypot({ value, onValue }: { value: string; onValue: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={value} onChange={(e) => onValue(e.target.value)} /></label>
    </div>
  );
}
