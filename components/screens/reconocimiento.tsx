import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";
import { RefreshButton } from "./_shared";

export default async function Reconocimiento() {
  const branchId = await currentBranchId();
  const now = new Date();
  const [vips, upcoming] = await Promise.all([
    prisma.customer.findMany({ where: { branchId, vip: true }, orderBy: { totalSpent: "desc" } }),
    prisma.reservation.findMany({ where: { branchId, dateTime: { gte: now }, status: { in: ["CONFIRMED", "PENDING", "SEATED"] } }, orderBy: { dateTime: "asc" }, take: 10 }),
  ]);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-on-surface">Reconocimiento de clientes · Llegadas VIP</h3>
        <RefreshButton />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-on-surface"><span className="material-symbols-outlined text-tertiary">star</span> Clientes VIP</h4>
          <div className="space-y-2">
            {(vips as any[]).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2">
                <div><p className="text-sm font-medium text-on-surface">{c.name}</p><p className="text-xs text-on-surface-variant">{c.visits} visitas · {c.notes || "—"}</p></div>
                <Badge tone="primary">{money(c.totalSpent)}</Badge>
              </div>
            ))}
            {vips.length === 0 && <p className="text-sm text-on-surface-variant">Sin clientes VIP.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-on-surface"><span className="material-symbols-outlined text-primary">door_front</span> Próximas llegadas</h4>
          <div className="space-y-2">
            {(upcoming as any[]).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2">
                <div><p className="text-sm font-medium text-on-surface">{r.guestName}</p><p className="text-xs text-on-surface-variant">{r.partySize} pax · {new Date(r.dateTime).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</p></div>
                <Badge tone={r.status === "CONFIRMED" ? "secondary" : "tertiary"}>{r.status}</Badge>
              </div>
            ))}
            {upcoming.length === 0 && <p className="text-sm text-on-surface-variant">Sin llegadas próximas.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
