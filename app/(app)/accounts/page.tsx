import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { PageHeader, Card, Badge, money } from "@/components/ui";
import { RowAction } from "@/components/screens/_shared";

export const dynamic = "force-dynamic";

const IT: Record<string, { t: any; l: string }> = {
  PENDING: { t: "primary", l: "En cola" },
  PREPARING: { t: "tertiary", l: "Preparando" },
  READY: { t: "secondary", l: "Listo" },
  SERVED: { t: "surface", l: "Servido" },
};

export default async function AccountsPage() {
  const branchId = await currentBranchId();
  const orders = await prisma.order.findMany({
    where: { branchId, status: { notIn: ["PAID", "CANCELLED"] } },
    orderBy: { createdAt: "asc" },
    include: { table: true, customer: true, items: true },
  });

  // group by table (null = para llevar / barra, keep per-order)
  type Grp = { tableId: string | null; tableName: string; orders: any[]; total: number };
  const byTable = new Map<string, Grp>();
  for (const o of orders as any[]) {
    const key = o.tableId ?? `takeaway-${o.id}`;
    const name = o.table?.name ?? "Para llevar / Barra";
    const g: Grp = byTable.get(key) ?? { tableId: o.tableId ?? null, tableName: name, orders: [], total: 0 };
    g.orders.push(o); g.total += o.total; byTable.set(key, g);
  }
  const groups = Array.from(byTable.values());
  const grand = groups.reduce((s, g) => s + g.total, 0);

  return (
    <div>
      <PageHeader title="Cuentas por Cobrar" subtitle={`${groups.length} cuentas abiertas · ${money(grand)} por cobrar`} icon="request_quote" />
      <div className="grid gap-4 p-5 lg:grid-cols-2 lg:p-6">
        {groups.map((g) => {
          const items = g.orders.flatMap((o: any) => o.items);
          const allServed = items.every((i: any) => i.status === "SERVED");
          return (
            <Card key={g.tableName + (g.tableId ?? "")} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-on-surface">{g.tableName}</h3>
                  <p className="text-xs text-on-surface-variant">
                    {g.orders.length} comanda(s) · {g.orders[0]?.customer?.name ?? "Sin cliente"}
                  </p>
                </div>
                <Badge tone={allServed ? "secondary" : "tertiary"}>{allServed ? "Lista para cobrar" : "En proceso"}</Badge>
              </div>
              <ul className="mb-3 space-y-1.5 border-y border-outline-variant/30 py-3">
                {items.map((it: any) => (
                  <li key={it.id} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface">{it.qty}× {it.name}</span>
                    <span className="flex items-center gap-2">
                      <Badge tone={IT[it.status]?.t ?? "surface"}>{IT[it.status]?.l ?? it.status}</Badge>
                      <span className="w-16 text-right text-on-surface-variant">{money(it.price * it.qty)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant">Total consumido</p>
                  <p className="font-display text-2xl font-bold text-primary">{money(g.total)}</p>
                </div>
                <RowAction
                  endpoint="/api/accounts/charge"
                  method="POST"
                  payload={g.tableId ? { tableId: g.tableId } : { orderId: g.orders[0].id }}
                  label="Cobrar cuenta"
                  icon="paid"
                  tone="secondary"
                  confirm={`¿Cobrar ${money(g.total)} de ${g.tableName}?`}
                />
              </div>
            </Card>
          );
        })}
        {groups.length === 0 && (
          <Card className="p-10 text-center text-on-surface-variant lg:col-span-2">
            No hay cuentas abiertas. Envía comandas desde el POS y aparecerán aquí para cobrar.
          </Card>
        )}
      </div>
    </div>
  );
}
