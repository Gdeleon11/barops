"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/components/ui";

type P = { id: string; name: string; price: number; categoryId: string | null; categoryName: string; color: string };
type C = { id: string; name: string; color: string };
type T = { id: string; name: string; status: string };

export default function POSClient({ products, categories, tables }: { products: P[]; categories: C[]; tables: T[] }) {
  const router = useRouter();
  const [cat, setCat] = useState<string | "all">("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tableId, setTableId] = useState<string>("");
  const [tip, setTip] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = useMemo(
    () => (cat === "all" ? products : products.filter((p) => p.categoryId === cat)),
    [cat, products]
  );
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id)!, qty }))
    .filter((l) => l.p);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax + (tip || 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const sub = (id: string) =>
    setCart((c) => {
      const n = (c[id] || 0) - 1;
      const nc = { ...c };
      if (n <= 0) delete nc[id];
      else nc[id] = n;
      return nc;
    });

  async function checkout(status: "PAID" | "SENT") {
    if (lines.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableId || null,
          tip: tip || 0,
          status,
          items: lines.map((l) => ({ productId: l.p.id, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setMsg(status === "PAID" ? `Ticket #${data.order.number} cobrado · ${money(data.order.total)}` : `Orden #${data.order.number} enviada a cocina`);
      setCart({});
      setTip(0);
      setTableId("");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message || "Error al procesar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Products */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-outline-variant/40 px-4 py-3">
          <button
            onClick={() => setCat("all")}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${cat === "all" ? "bg-primary-container text-white" : "bg-surface-container text-on-surface-variant"}`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${cat === c.id ? "bg-primary-container text-white" : "bg-surface-container text-on-surface-variant"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => add(p.id)}
              className="glass-card flex flex-col items-start rounded-xl p-3 text-left transition hover:border-primary/60 hover:neon-glow-primary"
            >
              <span className="mb-2 h-1.5 w-8 rounded-full" style={{ background: p.color }} />
              <span className="line-clamp-2 text-sm font-medium text-on-surface">{p.name}</span>
              <span className="mt-auto pt-2 font-display font-bold text-primary">{money(p.price)}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-on-surface-variant">Sin productos en esta categoría.</p>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="flex w-full flex-col border-t border-outline-variant/40 bg-surface-container-lowest lg:w-96 lg:border-l lg:border-t-0">
        <div className="border-b border-outline-variant/40 p-4">
          <label className="mb-1 block text-xs font-semibold uppercase text-on-surface-variant">Mesa</label>
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface"
          >
            <option value="">Para llevar / barra</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">Toca un producto para agregarlo.</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((l) => (
                <li key={l.p.id} className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2">
                  <div className="flex-1">
                    <p className="text-sm text-on-surface">{l.p.name}</p>
                    <p className="text-xs text-on-surface-variant">{money(l.p.price)}</p>
                  </div>
                  <button onClick={() => sub(l.p.id)} className="rounded bg-surface-container-high px-2 text-on-surface">−</button>
                  <span className="w-6 text-center text-sm text-on-surface">{l.qty}</span>
                  <button onClick={() => add(l.p.id)} className="rounded bg-surface-container-high px-2 text-on-surface">+</button>
                  <span className="w-16 text-right text-sm font-medium text-on-surface">{money(l.p.price * l.qty)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-outline-variant/40 p-4">
          <div className="mb-2 flex justify-between text-sm text-on-surface-variant"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="mb-2 flex justify-between text-sm text-on-surface-variant"><span>IVA (16%)</span><span>{money(tax)}</span></div>
          <div className="mb-2 flex items-center justify-between text-sm text-on-surface-variant">
            <span>Propina</span>
            <input
              type="number" min={0} value={tip || ""}
              onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
              className="w-24 rounded border border-outline-variant bg-surface-container px-2 py-1 text-right text-on-surface"
              placeholder="0"
            />
          </div>
          <div className="mb-3 flex justify-between border-t border-outline-variant/40 pt-2 font-display text-lg font-bold text-on-surface">
            <span>Total</span><span className="text-primary">{money(total)}</span>
          </div>
          {msg && <p className="mb-2 rounded-lg bg-secondary-container/20 px-3 py-2 text-center text-sm text-secondary">{msg}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={busy || lines.length === 0}
              onClick={() => checkout("SENT")}
              className="rounded-lg bg-surface-container-high py-3 text-sm font-semibold text-on-surface disabled:opacity-50"
            >
              Enviar a cocina
            </button>
            <button
              disabled={busy || lines.length === 0}
              onClick={() => checkout("PAID")}
              className="rounded-lg bg-primary-container py-3 text-sm font-semibold text-white disabled:opacity-50 neon-glow-primary"
            >
              {busy ? "…" : "Cobrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
