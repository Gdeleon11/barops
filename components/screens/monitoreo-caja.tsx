import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard, money, ORDER_STATUS_ES } from "@/components/ui";
import { RefreshButton } from "./_shared";

export default async function MonitoreoCaja() {
  const branchId = await currentBranchId();
  const shift = await prisma.shift.findFirst({ where: { branchId, closedAt: null }, include: { user: true } });
  const since = shift?.openedAt ?? new Date(new Date().setHours(0, 0, 0, 0));
  const orders = await prisma.order.findMany({ where: { branchId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, include: { waiter: true, table: true } });
  const paid = orders.filter((o: any) => o.status === "PAID");
  const sales = paid.reduce((s: number, o: any) => s + o.total, 0);
  const tips = paid.reduce((s: number, o: any) => s + o.tip, 0);
  const expectedCash = (shift?.openingCash ?? 0) + sales;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        {shift ? <Badge tone="secondary">Turno activo · {(shift as any).user?.name}</Badge> : <Badge tone="error">Sin turno abierto</Badge>}
        <RefreshButton />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Fondo inicial" value={money(shift?.openingCash ?? 0)} icon="savings" tone="primary" />
        <StatCard label="Ventas del turno" value={money(sales)} icon="trending_up" tone="secondary" hint={`${paid.length} tickets`} />
        <StatCard label="Propinas" value={money(tips)} icon="volunteer_activism" tone="tertiary" />
        <StatCard label="Efectivo esperado" value={money(expectedCash)} icon="account_balance_wallet" tone="primary" />
      </div>
      <Card className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">#</th><th>Hora</th><th>Mesa</th><th>Mesero</th><th>Estado</th><th className="text-right">Total</th></tr></thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-2.5 font-mono text-on-surface">#{o.number}</td>
                <td className="text-on-surface-variant">{new Date(o.createdAt).toLocaleTimeString("es-MX", { timeStyle: "short" })}</td>
                <td className="text-on-surface-variant">{o.table?.name ?? "—"}</td>
                <td className="text-on-surface-variant">{o.waiter?.name ?? "—"}</td>
                <td><Badge tone={o.status === "PAID" ? "secondary" : "primary"}>{ORDER_STATUS_ES[o.status] ?? o.status}</Badge></td>
                <td className="text-right font-medium text-on-surface">{money(o.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Sin movimientos en el turno.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
