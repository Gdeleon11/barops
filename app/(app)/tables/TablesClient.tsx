"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/ui";

type T = { id: string; name: string; seats: number; zone: string; status: string };

const CYCLE: Record<string, string> = { FREE: "OCCUPIED", OCCUPIED: "RESERVED", RESERVED: "CLEANING", CLEANING: "FREE" };
const STYLES: Record<string, { bg: string; label: string; icon: string }> = {
  FREE: { bg: "border-secondary/50 bg-secondary-container/10 text-secondary", label: "Libre", icon: "check_circle" },
  OCCUPIED: { bg: "border-primary/50 bg-primary-container/15 text-primary", label: "Ocupada", icon: "restaurant" },
  RESERVED: { bg: "border-tertiary/50 bg-tertiary-container/15 text-tertiary", label: "Reservada", icon: "event" },
  CLEANING: { bg: "border-outline/50 bg-surface-container text-on-surface-variant", label: "Limpieza", icon: "cleaning_services" },
};

export default function TablesClient({ tables }: { tables: T[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const zones = Array.from(new Set(tables.map((t) => t.zone)));

  const [form, setForm] = useState({ name: "", seats: 4, zone: zones[0] ?? "Salón" });
  const [edit, setEdit] = useState({ name: "", seats: 4, zone: "" });

  async function api(method: string, body: any) {
    setBusy(body.id ?? "new");
    await fetch("/api/tables", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(null);
    router.refresh();
  }

  async function cycle(t: T) { await api("PATCH", { id: t.id, status: CYCLE[t.status] }); }

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.zone.trim()) return;
    await api("POST", { name: form.name.trim(), seats: Number(form.seats) || 1, zone: form.zone.trim() });
    setForm({ ...form, name: "" });
    setShowAdd(false);
  }

  async function saveEdit(id: string) {
    await api("PATCH", { id, name: edit.name, seats: Number(edit.seats) || 1, zone: edit.zone });
    setEditId(null);
  }

  function startEdit(t: T) { setEditId(t.id); setEdit({ name: t.name, seats: t.seats, zone: t.zone }); }

  return (
    <div>
      <PageHeader
        title="Mesas y Salones"
        subtitle="Toca una mesa para cambiar su estado · edítala o elimínala con los íconos"
        icon="table_restaurant"
        action={
          <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-white">
            <span className="material-symbols-outlined text-[18px]">{showAdd ? "close" : "add"}</span> Nueva mesa / área
          </button>
        }
      />

      {showAdd && (
        <Card className="mx-5 mt-4 p-4 lg:mx-6">
          <form onSubmit={addTable} className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Nombre</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="M19 / Barra 3" className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Capacidad (pax)</label>
              <input type="number" min={1} value={form.seats} onChange={(e) => setForm({ ...form, seats: +e.target.value })} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Área / zona</label>
              <input list="zones" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Terraza, Barra, VIP…" className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
              <datalist id="zones">{zones.map((z) => <option key={z} value={z} />)}</datalist>
            </div>
            <button disabled={busy === "new"} className="self-end rounded-lg bg-secondary-container py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy === "new" ? "…" : "Agregar"}
            </button>
          </form>
          <p className="mt-2 text-xs text-on-surface-variant">Para crear una nueva <b>área/barra</b>, escribe un nombre de zona que no exista (ej. "VIP", "Barra 2").</p>
        </Card>
      )}

      <div className="space-y-6 p-5 lg:p-6">
        {zones.map((z) => (
          <div key={z}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">deck</span> {z}
              <span className="text-xs font-normal text-on-surface-variant">({tables.filter((t) => t.zone === z).length} mesas)</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {tables.filter((t) => t.zone === z).map((t) => {
                const s = STYLES[t.status];
                if (editId === t.id) {
                  return (
                    <Card key={t.id} className="p-3">
                      <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="mb-2 w-full rounded border border-outline-variant bg-surface-container px-2 py-1 text-sm text-on-surface" />
                      <input type="number" min={1} value={edit.seats} onChange={(e) => setEdit({ ...edit, seats: +e.target.value })} className="mb-2 w-full rounded border border-outline-variant bg-surface-container px-2 py-1 text-sm text-on-surface" />
                      <input list="zones" value={edit.zone} onChange={(e) => setEdit({ ...edit, zone: e.target.value })} className="mb-2 w-full rounded border border-outline-variant bg-surface-container px-2 py-1 text-sm text-on-surface" />
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(t.id)} className="flex-1 rounded bg-secondary-container py-1 text-xs font-semibold text-white">Guardar</button>
                        <button onClick={() => setEditId(null)} className="rounded bg-surface-container-high px-2 py-1 text-xs text-on-surface">Cancelar</button>
                      </div>
                    </Card>
                  );
                }
                return (
                  <div key={t.id} className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 ${s.bg}`}>
                    <div className="absolute right-1.5 top-1.5 flex gap-1">
                      <button onClick={() => startEdit(t)} className="rounded bg-surface-container/80 p-1 text-on-surface-variant hover:text-primary" title="Editar">
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button onClick={() => { if (confirm(`¿Eliminar ${t.name}?`)) api("DELETE", { id: t.id }); }} className="rounded bg-surface-container/80 p-1 text-on-surface-variant hover:text-error" title="Eliminar">
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                    <button disabled={busy === t.id} onClick={() => cycle(t)} className="flex flex-1 w-full flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                      <span className="mt-1 font-display text-lg font-bold">{t.name}</span>
                      <span className="text-xs opacity-80">{t.seats} pax · {s.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {tables.length === 0 && <Card className="p-10 text-center text-on-surface-variant">Sin mesas. Agrega la primera con "Nueva mesa / área".</Card>}
      </div>
    </div>
  );
}
