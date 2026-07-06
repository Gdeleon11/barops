"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Badge, money } from "@/components/ui";

type Item = { id: string; name: string; unit: string; stock: number; parLevel: number; cost: number; supplier: string };

export default function InventoryClient({ items }: { items: Item[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "unidad", stock: 0, parLevel: 0, cost: 0, supplier: "" });

  async function adjust(id: string, delta: number) {
    await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delta }),
    });
    router.refresh();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, unit: form.unit,
        stock: Number(form.stock), parLevel: Number(form.parLevel), cost: Number(form.cost),
        supplier: form.supplier || null,
      }),
    });
    setForm({ name: "", unit: "unidad", stock: 0, parLevel: 0, cost: 0, supplier: "" });
    setShowForm(false);
    setBusy(false);
    router.refresh();
  }

  const totalValue = items.reduce((s, i) => s + i.stock * i.cost, 0);

  return (
    <div>
      <PageHeader
        title="Inventario General"
        subtitle={`${items.length} insumos · valor ${money(totalValue)}`}
        icon="inventory_2"
        action={
          <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-white">
            <span className="material-symbols-outlined text-[18px]">add</span> Nuevo insumo
          </button>
        }
      />

      {showForm && (
        <Card className="mx-5 mt-4 p-4 lg:mx-6">
          <form onSubmit={create} className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input placeholder="Unidad" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input type="number" placeholder="Mínimo" value={form.parLevel} onChange={(e) => setForm({ ...form, parLevel: +e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input type="number" placeholder="Costo" value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input placeholder="Proveedor" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="col-span-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <button disabled={busy} className="col-span-2 rounded-lg bg-secondary-container py-2 text-sm font-semibold text-white md:col-span-1">{busy ? "…" : "Guardar"}</button>
          </form>
        </Card>
      )}

      <div className="p-5 lg:p-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant">
                  <th className="px-4 py-3">Insumo</th><th>Proveedor</th><th className="text-right">Costo</th>
                  <th className="text-center">Stock</th><th className="text-center">Mínimo</th><th className="text-center">Ajustar</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const low = i.stock <= i.parLevel;
                  return (
                    <tr key={i.id} className="border-b border-outline-variant/20 hover:bg-surface-container/40">
                      <td className="px-4 py-3 font-medium text-on-surface">{i.name}</td>
                      <td className="text-on-surface-variant">{i.supplier || "—"}</td>
                      <td className="text-right text-on-surface-variant">{money(i.cost)}</td>
                      <td className="text-center font-mono text-on-surface">{i.stock} {i.unit}</td>
                      <td className="text-center text-on-surface-variant">{i.parLevel}</td>
                      <td className="text-center">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => adjust(i.id, -1)} className="rounded bg-surface-container-high px-2 py-0.5 text-on-surface">−</button>
                          <button onClick={() => adjust(i.id, 1)} className="rounded bg-surface-container-high px-2 py-0.5 text-on-surface">+</button>
                        </div>
                      </td>
                      <td>{low ? <Badge tone="error">Reponer</Badge> : <Badge tone="secondary">OK</Badge>}</td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-on-surface-variant">Sin insumos. Agrega el primero.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
