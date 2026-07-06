"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Ing = { ingredient: string; qty: number; unit: string; cost: number };
const CATS = ["Cócteles", "Cervezas", "Vinos", "Destilados", "Cocina", "Postres", "Otros"];
const UNITS = ["ml", "oz", "g", "kg", "pza", "porción"];

export default function RecipeForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cócteles");
  const [yield_, setYield] = useState("");
  const [salePrice, setSalePrice] = useState<number>(0);
  const [items, setItems] = useState<Ing[]>([{ ingredient: "", qty: 0, unit: "ml", cost: 0 }]);

  const totalCost = items.reduce((s, i) => s + (Number(i.cost) || 0), 0);
  const margin = salePrice ? ((salePrice - totalCost) / salePrice) * 100 : 0;

  const setItem = (idx: number, patch: Partial<Ing>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addRow = () => setItems((a) => [...a, { ingredient: "", qty: 0, unit: "ml", cost: 0 }]);
  const delRow = (idx: number) => setItems((a) => a.filter((_, i) => i !== idx));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const cleanItems = items
      .filter((i) => i.ingredient.trim())
      .map((i) => ({ ingredient: i.ingredient, qty: Number(i.qty) || 0, unit: i.unit, cost: Number(i.cost) || 0 }));
    try {
      const res = await fetch("/api/x/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, yield: yield_, salePrice: Number(salePrice) || 0, items: cleanItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setName(""); setCategory("Cócteles"); setYield(""); setSalePrice(0);
      setItems([{ ingredient: "", qty: 0, unit: "ml", cost: 0 }]);
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-white">
        <span className="material-symbols-outlined text-[18px]">add</span> Nueva receta
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card w-full max-w-2xl rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-display text-base font-semibold text-on-surface">Nueva receta / escandallo</h4>
        <button type="button" onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="col-span-2">
          <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Nombre</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Margarita Clásica" className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface">
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Rendimiento</label>
          <input value={yield_} onChange={(e) => setYield(e.target.value)} placeholder="1 copa" className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
        </div>
      </div>

      <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Ingredientes</label>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2">
            <input value={it.ingredient} onChange={(e) => setItem(idx, { ingredient: e.target.value })} placeholder="Ingrediente" className="col-span-5 rounded-lg border border-outline-variant bg-surface-container px-2 py-1.5 text-sm text-on-surface" />
            <input type="number" value={it.qty || ""} onChange={(e) => setItem(idx, { qty: +e.target.value })} placeholder="Cant." className="col-span-2 rounded-lg border border-outline-variant bg-surface-container px-2 py-1.5 text-sm text-on-surface" />
            <select value={it.unit} onChange={(e) => setItem(idx, { unit: e.target.value })} className="col-span-2 rounded-lg border border-outline-variant bg-surface-container px-1 py-1.5 text-sm text-on-surface">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={it.cost || ""} onChange={(e) => setItem(idx, { cost: +e.target.value })} placeholder="Costo $" className="col-span-2 rounded-lg border border-outline-variant bg-surface-container px-2 py-1.5 text-sm text-on-surface" />
            <button type="button" onClick={() => delRow(idx)} className="col-span-1 rounded-lg bg-surface-container-high text-error" title="Quitar">
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline">
        <span className="material-symbols-outlined text-[16px]">add</span> Agregar ingrediente
      </button>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-outline-variant/30 pt-3">
        <div>
          <label className="mb-1 block text-[11px] uppercase text-on-surface-variant">Precio de venta $</label>
          <input type="number" value={salePrice || ""} onChange={(e) => setSalePrice(+e.target.value)} placeholder="0" className="w-32 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
        </div>
        <div className="text-sm text-on-surface-variant">
          Costo: <span className="text-on-surface">${totalCost.toFixed(2)}</span> · Margen: <span className={margin >= 60 ? "text-secondary" : "text-tertiary"}>{margin.toFixed(0)}%</span>
        </div>
        <button disabled={busy} className="rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Guardando…" : "Guardar receta"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-error">{err}</p>}
    </form>
  );
}
