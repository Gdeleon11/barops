"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "checkbox" | "datetime" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
  def?: any;
  required?: boolean;
  span?: number;
};

export function EntityForm({
  endpoint,
  method = "POST",
  fields,
  submitLabel = "Guardar",
  title,
  transform,
}: {
  endpoint: string;
  method?: string;
  fields: Field[];
  submitLabel?: string;
  title?: string;
  transform?: (v: Record<string, any>) => Record<string, any>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const init = Object.fromEntries(fields.map((f) => [f.name, f.def ?? (f.type === "checkbox" ? false : f.type === "number" ? 0 : "")]));
  const [v, setV] = useState<Record<string, any>>(init);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const payload: Record<string, any> = {};
    for (const f of fields) {
      let val = v[f.name];
      if (f.type === "number") val = Number(val) || 0;
      payload[f.name] = val;
    }
    const body = transform ? transform(payload) : payload;
    try {
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setV(init);
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-white">
        <span className="material-symbols-outlined text-[18px]">{open ? "close" : "add"}</span>
        {title ?? "Nuevo"}
      </button>
      {open && (
        <form onSubmit={submit} className="glass-card mt-3 grid grid-cols-2 gap-3 rounded-xl p-4 md:grid-cols-4">
          {fields.map((f) => (
            <div key={f.name} className={`col-span-${f.span ?? 1}`} style={{ gridColumn: f.span ? `span ${f.span}` : undefined }}>
              <label className="mb-1 block text-[11px] uppercase tracking-wide text-on-surface-variant">{f.label}</label>
              {f.type === "select" ? (
                <select value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface">
                  {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === "checkbox" ? (
                <input type="checkbox" checked={!!v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.checked })} className="h-5 w-5" />
              ) : f.type === "textarea" ? (
                <textarea value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} placeholder={f.placeholder} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
              ) : (
                <input
                  type={f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : "text"}
                  required={f.required}
                  value={v[f.name]}
                  onChange={(e) => setV({ ...v, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface"
                />
              )}
            </div>
          ))}
          {err && <p className="col-span-full text-sm text-error">{err}</p>}
          <button disabled={busy} className="col-span-2 rounded-lg bg-secondary-container py-2 text-sm font-semibold text-white md:col-span-1">
            {busy ? "…" : submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}

export function RowAction({
  endpoint,
  method = "PATCH",
  payload,
  label,
  icon,
  tone = "surface",
  confirm,
}: {
  endpoint: string;
  method?: string;
  payload: Record<string, any>;
  label: string;
  icon?: string;
  tone?: "surface" | "primary" | "secondary" | "tertiary" | "error";
  confirm?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const tones: Record<string, string> = {
    surface: "bg-surface-container-high text-on-surface hover:bg-surface-container",
    primary: "bg-primary-container/25 text-primary hover:bg-primary-container/40",
    secondary: "bg-secondary-container/25 text-secondary hover:bg-secondary-container/40",
    tertiary: "bg-tertiary-container/25 text-tertiary hover:bg-tertiary-container/40",
    error: "bg-error-container/30 text-error hover:bg-error-container/50",
  };
  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    router.refresh();
  }
  return (
    <button onClick={run} disabled={busy} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${tones[tone]}`}>
      {icon && <span className="material-symbols-outlined text-[15px]">{icon}</span>}
      {label}
    </button>
  );
}

export function RefreshButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.refresh()} className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface">
      <span className="material-symbols-outlined text-[18px]">refresh</span> Actualizar
    </button>
  );
}
