import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { PageHeader, StatCard, Card, Badge, money } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const branchId = await currentBranchId();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [paidToday, openOrders, tables, lowStock, recentOrders, customers] = await Promise.all([
    prisma.order.findMany({
      where: { branchId, status: "PAID", createdAt: { gte: startOfDay } },
      select: { total: true },
    }),
    prisma.order.count({ where: { branchId, status: { in: ["OPEN", "SENT", "PREPARING", "READY", "SERVED"] } } }),
    prisma.restaurantTable.findMany({ where: { branchId }, select: { status: true } }),
    prisma.inventoryItem.findMany({ where: { branchId } }),
    prisma.order.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { table: true, waiter: true },
    }),
    prisma.customer.count({ where: { branchId } }),
  ]);

  const salesToday = paidToday.reduce((s, o) => s + o.total, 0);
  const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
  const low = lowStock.filter((i) => i.stock <= i.parLevel);

  const statusTone: Record<string, string> = {
    OPEN: "primary", SENT: "tertiary", PREPARING: "tertiary",
    READY: "secondary", SERVED: "secondary", PAID: "surface", CANCELLED: "error",
  };

  return (
    <div>
      <PageHeader title="Dashboard Ejecutivo" subtitle="Resumen operativo en tiempo real" icon="dashboard" />
      <div className="grid grid-cols-2 gap-3 p-5 lg:grid-cols-4 lg:p-6">
        <StatCard label="Ventas hoy" value={money(salesToday)} icon="payments" tone="secondary" hint={`${paidToday.length} tickets cerrados`} />
        <StatCard label="Órdenes activas" value={String(openOrders)} icon="receipt_long" tone="primary" hint="En servicio ahora" />
        <StatCard label="Mesas ocupadas" value={`${occupied}/${tables.length}`} icon="table_restaurant" tone="tertiary" hint="Ocupación de salón" />
        <StatCard label="Clientes CRM" value={String(customers)} icon="groups" tone="primary" hint="Base de datos" />
      </div>

      <div className="grid gap-4 px-5 pb-6 lg:grid-cols-3 lg:px-6">
        <Card className="lg:col-span-2 p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-on-surface">Órdenes recientes</h2>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              Aún no hay órdenes. Ve al POS para crear la primera.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-on-surface-variant">
                    <th className="py-2">#</th><th>Mesa</th><th>Mesero</th><th>Estado</th><th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-outline-variant/30">
                      <td className="py-2 font-mono text-on-surface">#{o.number}</td>
                      <td className="text-on-surface-variant">{o.table?.name ?? "—"}</td>
                      <td className="text-on-surface-variant">{o.waiter?.name ?? "—"}</td>
                      <td><Badge tone={statusTone[o.status] ?? "surface"}>{o.status}</Badge></td>
                      <td className="text-right font-medium text-on-surface">{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-on-surface">
            <span className="material-symbols-outlined text-error">warning</span> Stock bajo
          </h2>
          {low.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">Todo el inventario está sobre el nivel mínimo.</p>
          ) : (
            <ul className="space-y-2">
              {low.slice(0, 8).map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2">
                  <span className="text-sm text-on-surface">{i.name}</span>
                  <Badge tone="error">{i.stock} {i.unit}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
