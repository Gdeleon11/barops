import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { RowAction, RefreshButton } from "./_shared";

const DRINK_CATS = ["Cócteles", "Cervezas", "Vinos", "Destilados"];
const NEXT: Record<string, string> = { PENDING: "PREPARING", PREPARING: "READY", READY: "SERVED" };
const COLS = ["PENDING", "PREPARING", "READY"];
const COL_LABEL: Record<string, string> = { PENDING: "En cola", PREPARING: "Preparando", READY: "Listo para servir" };
const COL_TONE: Record<string, "primary" | "tertiary" | "secondary"> = { PENDING: "primary", PREPARING: "tertiary", READY: "secondary" };
const NEXT_LABEL: Record<string, string> = { PREPARING: "Preparar", READY: "Marcar listo", SERVED: "Marcar servido" };

export async function Board({ kind }: { kind: "kitchen" | "bar" }) {
  const branchId = await currentBranchId();
  const orders = await prisma.order.findMany({
    where: { branchId, status: { notIn: ["PAID", "CANCELLED"] } },
    orderBy: { createdAt: "asc" },
    include: { table: true, items: { include: { product: { include: { category: true } } } } },
  });

  type Row = { item: any; order: any };
  const rows: Row[] = [];
  for (const o of orders as any[]) {
    for (const it of o.items) {
      const cat = it.product?.category?.name ?? "";
      const isDrink = DRINK_CATS.includes(cat);
      if ((kind === "bar") !== isDrink) continue;
      if (it.status === "SERVED") continue;
      rows.push({ item: it, order: o });
    }
  }

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          {rows.length} ítems activos · {kind === "bar" ? "barra" : "cocina"}
        </p>
        <RefreshButton />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map((col) => {
          const list = rows.filter((r) => (r.item.status ?? "PENDING") === col);
          return (
            <div key={col}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-on-surface">{COL_LABEL[col]}</h3>
                <Badge tone={COL_TONE[col]}>{list.length}</Badge>
              </div>
              <div className="space-y-3">
                {list.map(({ item, order }) => {
                  const mins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                  const late = mins >= 12;
                  return (
                    <Card key={item.id} className={`p-3 ${late ? "border-error/50" : ""}`}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-on-surface">#{order.number} · {order.table?.name ?? "Barra"}</span>
                        <span className={`text-xs ${late ? "text-error" : "text-on-surface-variant"}`}>{mins} min</span>
                      </div>
                      <p className="mb-2 text-sm font-medium text-on-surface">{item.qty}× {item.name}</p>
                      {NEXT[col] && (
                        <RowAction
                          endpoint="/api/order-items"
                          method="PATCH"
                          payload={{ itemId: item.id, status: NEXT[col] }}
                          label={NEXT_LABEL[NEXT[col]]}
                          icon="arrow_forward"
                          tone={COL_TONE[NEXT[col]] ?? "primary"}
                        />
                      )}
                    </Card>
                  );
                })}
                {list.length === 0 && <p className="rounded-lg border border-dashed border-outline-variant/40 py-6 text-center text-xs text-on-surface-variant">Vacío</p>}
              </div>
            </div>
          );
        })}
      </div>
      {rows.length === 0 && (
        <Card className="mt-4 p-10 text-center text-on-surface-variant">
          No hay ítems activos. Envía una comanda desde el POS (botón "Enviar a cocina").
        </Card>
      )}
    </div>
  );
}
