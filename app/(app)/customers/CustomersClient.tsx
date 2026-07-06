"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Badge, money } from "@/components/ui";

type C = { id: string; name: string; phone: string; email: string; notes: string; loyaltyPts: number; visits: number; totalSpent: number; vip: boolean };

export default function CustomersClient({ customers }: { customers: C[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", vip: false });

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", email: "", notes: "", vip: false });
    setShow(false);
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="CRM Clientes"
        subtitle={`${customers.length} clientes en la base`}
        icon="groups"
        action={
          <button onClick={() => setShow((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-white">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Nuevo cliente
          </button>
        }
      />

      {show && (
        <Card className="mx-5 mt-4 p-4 lg:mx-6">
          <form onSubmit={create} className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              <input type="checkbox" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} /> VIP
            </label>
            <input placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface md:col-span-3" />
            <button disabled={busy} className="rounded-lg bg-secondary-container py-2 text-sm font-semibold text-white">{busy ? "…" : "Guardar"}</button>
          </form>
        </Card>
      )}

      <div className="p-5 lg:p-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono…"
          className="mb-4 w-full max-w-sm rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 font-medium text-on-surface">
                    {c.name} {c.vip && <Badge tone="tertiary">VIP</Badge>}
                  </p>
                  <p className="text-xs text-on-surface-variant">{c.phone || c.email || "Sin contacto"}</p>
                </div>
                <span className="material-symbols-outlined text-primary">loyalty</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-outline-variant/30 pt-3 text-center">
                <div><p className="font-display text-lg font-bold text-on-surface">{c.visits}</p><p className="text-[10px] uppercase text-on-surface-variant">Visitas</p></div>
                <div><p className="font-display text-lg font-bold text-secondary">{c.loyaltyPts}</p><p className="text-[10px] uppercase text-on-surface-variant">Puntos</p></div>
                <div><p className="font-display text-sm font-bold text-on-surface">{money(c.totalSpent)}</p><p className="text-[10px] uppercase text-on-surface-variant">Gastado</p></div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <Card className="col-span-full p-10 text-center text-on-surface-variant">Sin clientes.</Card>}
        </div>
      </div>
    </div>
  );
}
