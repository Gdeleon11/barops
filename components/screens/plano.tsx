import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import PlanoClient from "./PlanoClient";

export default async function Plano() {
  const branchId = await currentBranchId();
  const [tables, openOrders] = await Promise.all([
    prisma.restaurantTable.findMany({ where: { branchId }, orderBy: { name: "asc" } }),
    prisma.order.findMany({ where: { branchId, status: { in: ["OPEN", "SENT", "PREPARING", "READY", "SERVED"] } } }),
  ]);
  const totals: Record<string, { total: number; n: number }> = {};
  for (const o of openOrders as any[]) {
    if (!o.tableId) continue;
    const cur = totals[o.tableId] ?? { total: 0, n: 0 };
    cur.total += o.total; cur.n += 1; totals[o.tableId] = cur;
  }
  const plain = (tables as any[]).map((t) => ({ id: t.id, name: t.name, seats: t.seats, zone: t.zone, status: t.status }));
  const serviceTotal = (openOrders as any[]).reduce((s, o) => s + o.total, 0);
  return <PlanoClient tables={plain} totals={totals} serviceTotal={serviceTotal} />;
}
