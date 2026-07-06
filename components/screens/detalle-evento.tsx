import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";

const lvl: Record<string, any> = { INFO: "surface", WARNING: "tertiary", CRITICAL: "error" };

export default async function DetalleEvento() {
  const branchId = await currentBranchId();
  const events = await (prisma as any).auditLog.findMany({
    where: { branchId, severity: { in: ["WARNING", "CRITICAL"] } },
    orderBy: { createdAt: "desc" }, take: 15,
  });
  const featured = events[0];

  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Detalle de eventos de seguridad y comparativa</p>
      {featured ? (
        <Card className="mb-4 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-on-surface">{featured.action}</h3>
            <Badge tone={lvl[featured.severity]}>{featured.severity}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div><p className="text-xs uppercase text-on-surface-variant">Actor</p><p className="font-medium text-on-surface">{featured.actor}</p></div>
            <div><p className="text-xs uppercase text-on-surface-variant">Objetivo</p><p className="font-medium text-on-surface">{featured.target || "—"}</p></div>
            <div><p className="text-xs uppercase text-on-surface-variant">Fecha</p><p className="font-medium text-on-surface">{new Date(featured.createdAt).toLocaleString("es-MX")}</p></div>
          </div>
          {featured.detail && <p className="mt-3 rounded-lg bg-surface-container px-3 py-2 text-sm text-on-surface-variant">{featured.detail}</p>}
        </Card>
      ) : (
        <Card className="mb-4 p-10 text-center text-on-surface-variant">Sin eventos de seguridad relevantes.</Card>
      )}
      <h4 className="mb-2 font-display text-sm font-semibold text-on-surface">Otros eventos de atención</h4>
      <div className="space-y-2">
        {events.slice(1).map((e: any) => (
          <Card key={e.id} className="flex items-center gap-3 p-3">
            <span className={`material-symbols-outlined ${e.severity === "CRITICAL" ? "text-error" : "text-tertiary"}`}>shield</span>
            <div className="flex-1"><p className="text-sm font-medium text-on-surface">{e.action} · {e.actor}</p><p className="text-xs text-on-surface-variant">{e.detail || e.target || ""}</p></div>
            <span className="text-xs text-on-surface-variant">{new Date(e.createdAt).toLocaleDateString("es-MX")}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
