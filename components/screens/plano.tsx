import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";
import { RowAction, RefreshButton } from "./_shared";

const STYLE: Record<string, { c: string; label: string; icon: string }> = {
  FREE: { c: "border-secondary/50 bg-secondary-container/10", label: "Libre", icon: "check_circle" },
  OCCUPIED: { c: "border-primary/50 bg-primary-container/15", label: "Ocupada", icon: "restaurant" },
  RESERVED: { c: "border-tertiary/50 bg-tertiary-container/15", label: "Reservada", icon: "event" },
  CLEANING: { c: "border-outline/40 bg-surface-container", label: "Limpieza", icon: "cleaning_services" },
};
const NEXT: Record<string, string> = { FREE: "OCCUPIED", OCCUPIED: "CLEANING", CLEANING: "FREE", RESERVED: "OCCUPIED" };

export default async function Plano() {
  const branchId = await currentBranchId();
  const [tables, openOrders] = await Promise.all([
    prisma.restaurantTable.findMany({ where: { branchId }, orderBy: { name: "asc" } }),
    prisma.order.findMany({ where: { branchId, status: { in: ["OPEN", "SENT", "PREPARING", "READY", "SERVED"] } } }),
  ]);
  const byTable = new Map<string, { total: number; n: number }>();
  for (const o of openOrders as any[]) {
    if (!o.tableId) continue;
    const cur = byTable.get(o.tableId) ?? { total: 0, n: 0 };
    cur.total += o.total; cur.n += 1; byTable.set(o.tableId, cur);
  }
  const zones = Array.from(new Set((tables as any[]).map((t) => t.zone)));
  const occ = (tables as any[]).filter((t) => t.status === "OCCUPIED").length;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Badge tone="primary">{occ} ocupadas</Badge>
          <Badge tone="secondary">{tables.length - occ} disponibles</Badge>
          <Badge tone="tertiary">{money((openOrders as any[]).reduce((s, o) => s + o.total, 0))} en servicio</Badge>
        </div>
        <RefreshButton />
      </div>
      <div className="space-y-6">
        {zones.map((z) => (
          <div key={z}>
            <h3 className="mb-3 font-display text-base font-semibold text-on-surface">{z}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {(tables as any[]).filter((t) => t.zone === z).map((t) => {
                const s = STYLE[t.status]; const info = byTable.get(t.id);
                return (
                  <Card key={t.id} className={`flex flex-col border-2 p-3 ${s.c}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-bold text-on-surface">{t.name}</span>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{s.icon}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">{t.seats} pax · {s.label}</span>
                    {info && <span className="mt-1 text-sm font-medium text-primary">{money(info.total)} · {info.n} orden(es)</span>}
                    <div className="mt-2">
                      <RowAction endpoint="/api/tables" method="PATCH" payload={{ id: t.id, status: NEXT[t.status] }} label={`→ ${STYLE[NEXT[t.status]].label}`} tone="surface" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
