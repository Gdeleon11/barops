import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, StatCard, money } from "@/components/ui";
import { RefreshButton } from "./_shared";

export default async function ReporteZ() {
  const branchId = await currentBranchId();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const paid = await prisma.order.findMany({
    where: { branchId, status: "PAID", createdAt: { gte: start } },
    include: { items: { include: { product: { include: { category: true } } } } },
  });
  const gross = paid.reduce((s: number, o: any) => s + o.subtotal, 0);
  const tax = paid.reduce((s: number, o: any) => s + o.tax, 0);
  const tips = paid.reduce((s: number, o: any) => s + o.tip, 0);
  const total = paid.reduce((s: number, o: any) => s + o.total, 0);
  const avg = paid.length ? total / paid.length : 0;

  const byCat = new Map<string, number>();
  for (const o of paid as any[]) for (const it of o.items) {
    const c = it.product?.category?.name ?? "Otros";
    byCat.set(c, (byCat.get(c) ?? 0) + it.price * it.qty);
  }
  const cats = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-on-surface">Reporte Z — Cierre diario</h3>
          <p className="text-sm text-on-surface-variant">{new Date().toLocaleDateString("es-MX", { dateStyle: "full" })}</p>
        </div>
        <RefreshButton />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Venta neta" value={money(gross)} icon="payments" tone="secondary" />
        <StatCard label="IVA recaudado" value={money(tax)} icon="receipt" tone="tertiary" />
        <StatCard label="Propinas" value={money(tips)} icon="volunteer_activism" tone="primary" />
        <StatCard label="Total bruto" value={money(total)} icon="account_balance" tone="secondary" hint={`${paid.length} tickets · ticket prom. ${money(avg)}`} />
      </div>
      <Card className="mt-4 p-5">
        <h4 className="mb-3 font-display text-sm font-semibold text-on-surface">Ventas por categoría</h4>
        {cats.length === 0 ? <p className="text-sm text-on-surface-variant">Sin ventas hoy.</p> : (
          <div className="space-y-2">
            {cats.map(([c, v]) => {
              const pct = gross ? (v / gross) * 100 : 0;
              return (
                <div key={c}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-on-surface">{c}</span><span className="text-on-surface-variant">{money(v)} · {pct.toFixed(0)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-primary-container" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
