import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { RowAction, RefreshButton } from "./_shared";

const DRINK_CATS = ["Cócteles", "Cervezas", "Vinos", "Destilados"];
const NEXT: Record<string, string> = { SENT: "PREPARING", PREPARING: "READY", READY: "SERVED" };
const COLS = ["SENT", "PREPARING", "READY"];
const COL_LABEL: Record<string, string> = { SENT: "En cola", PREPARING: "Preparando", READY: "Listo para servir" };
const COL_TONE: Record<string, "primary" | "tertiary" | "secondary"> = { SENT: "primary", PREPARING: "tertiary", READY: "secondary" };

export async function Board({ kind }: { kind: "kitchen" | "bar" }) {
  const branchId = await currentBranchId();
  const orders = await prisma.order.findMany({
    where: { branchId, status: { in: ["SENT", "PREPARING", "READY"] } },
    orderBy: { createdAt: "asc" },
    include: { table: true, items: { include: { product: { include: { category: true } } } } },
  });

  const filtered = orders
    .map((o: any) => {
      const items = o.items.filter((it: any) => {
        const cat = it.product?.category?.name ?? "";
        const isDrink = DRINK_CATS.includes(cat);
        return kind === "bar" ? isDrink : !isDrink;
      });
      return { ...o, relItems: items };
    })
    .filter((o: any) => o.relItems.length > 0);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          {filtered.length} comandas activas · {kind === "bar" ? "barra" : "cocina"}
        </p>
        <RefreshButton />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map((col) => {
          const list = filtered.filter((o: any) => o.status === col);
          return (
            <div key={col}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-on-surface">{COL_LABEL[col]}</h3>
                <Badge tone={COL_TONE[col]}>{list.length}</Badge>
              </div>
              <div className="space-y-3">
                {list.map((o: any) => {
                  const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000);
                  const late = mins >= 12;
                  return (
                    <Card key={o.id} className={`p-3 ${late ? "border-error/50" : ""}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-on-surface">#{o.number}</span>
                        <span className={`text-xs ${late ? "text-error" : "text-on-surface-variant"}`}>{mins} min · {o.table?.name ?? "Barra"}</span>
                      </div>
                      <ul className="mb-3 space-y-1">
                        {o.relItems.map((it: any) => (
                          <li key={it.id} className="flex justify-between text-sm text-on-surface">
                            <span>{it.qty}× {it.name}</span>
                          </li>
                        ))}
                      </ul>
                      {NEXT[col] && (
                        <RowAction
                          endpoint="/api/orders"
                          method="PATCH"
                          payload={{ id: o.id, status: NEXT[col] }}
                          label={col === "READY" ? "Marcar servido" : `Pasar a ${COL_LABEL[NEXT[col]]}`}
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
      {filtered.length === 0 && (
        <Card className="mt-4 p-10 text-center text-on-surface-variant">
          No hay comandas activas. Envía una orden desde el POS (botón "Enviar a cocina").
        </Card>
      )}
    </div>
  );
}
