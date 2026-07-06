import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, StatCard, money } from "@/components/ui";

const COMMISSION_PCT = 3; // % sobre ventas

export default async function Comisiones() {
  const branchId = await currentBranchId();
  const orders = await prisma.order.findMany({ where: { branchId, status: "PAID" }, include: { waiter: true } });
  const map = new Map<string, { name: string; sales: number; tips: number; tickets: number }>();
  for (const o of orders as any[]) {
    const key = o.waiterId ?? "sin";
    const name = o.waiter?.name ?? "Sin asignar";
    const cur = map.get(key) ?? { name, sales: 0, tips: 0, tickets: 0 };
    cur.sales += o.subtotal; cur.tips += o.tip; cur.tickets += 1; map.set(key, cur);
  }
  const rows = Array.from(map.values()).sort((a, b) => b.sales - a.sales);
  const totalTips = rows.reduce((s, r) => s + r.tips, 0);
  const totalComm = rows.reduce((s, r) => s + r.sales * (COMMISSION_PCT / 100), 0);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Propinas acumuladas" value={money(totalTips)} icon="volunteer_activism" tone="tertiary" />
        <StatCard label={`Comisiones (${COMMISSION_PCT}%)`} value={money(totalComm)} icon="percent" tone="primary" />
        <StatCard label="Meseros activos" value={String(rows.length)} icon="groups" tone="secondary" />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Empleado</th><th className="text-center">Tickets</th><th className="text-right">Ventas</th><th className="text-right">Propinas</th><th className="text-right">Comisión</th><th className="text-right">Total a pagar</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const comm = r.sales * (COMMISSION_PCT / 100);
              return (
                <tr key={r.name} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{r.name}</td>
                  <td className="text-center text-on-surface">{r.tickets}</td>
                  <td className="text-right text-on-surface-variant">{money(r.sales)}</td>
                  <td className="text-right text-tertiary">{money(r.tips)}</td>
                  <td className="text-right text-primary">{money(comm)}</td>
                  <td className="text-right font-semibold text-secondary">{money(r.tips + comm)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Sin ventas cobradas todavía.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
