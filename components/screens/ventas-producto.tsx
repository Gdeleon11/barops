import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, StatCard, money } from "@/components/ui";
import { RefreshButton } from "./_shared";

export default async function VentasProducto() {
  const branchId = await currentBranchId();
  const items = await prisma.orderItem.findMany({
    where: { order: { branchId, status: "PAID" } },
    include: { product: { include: { category: true } } },
  });
  const map = new Map<string, { name: string; cat: string; qty: number; rev: number }>();
  for (const it of items as any[]) {
    const key = it.name;
    const cur = map.get(key) ?? { name: it.name, cat: it.product?.category?.name ?? "Otros", qty: 0, rev: 0 };
    cur.qty += it.qty; cur.rev += it.price * it.qty; map.set(key, cur);
  }
  const rows = Array.from(map.values()).sort((a, b) => b.rev - a.rev);
  const totalRev = rows.reduce((s, r) => s + r.rev, 0);
  const totalQty = rows.reduce((s, r) => s + r.qty, 0);
  const max = rows[0]?.rev ?? 1;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-3">
          <StatCard label="Ingresos" value={money(totalRev)} icon="payments" tone="secondary" />
          <StatCard label="Unidades vendidas" value={String(totalQty)} icon="shopping_bag" tone="primary" />
          <StatCard label="Productos activos" value={String(rows.length)} icon="category" tone="tertiary" />
        </div>
        <RefreshButton />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">#</th><th>Producto</th><th>Categoría</th><th className="text-center">Uds.</th><th className="text-right">Ingresos</th><th className="w-1/4">Participación</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name} className="border-b border-outline-variant/20">
                <td className="px-4 py-2.5 font-mono text-on-surface-variant">{i + 1}</td>
                <td className="font-medium text-on-surface">{r.name}</td>
                <td className="text-on-surface-variant">{r.cat}</td>
                <td className="text-center text-on-surface">{r.qty}</td>
                <td className="text-right font-medium text-on-surface">{money(r.rev)}</td>
                <td><div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full bg-primary-container" style={{ width: `${(r.rev / max) * 100}%` }} /></div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Aún no hay ventas. Cobra órdenes en el POS.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
