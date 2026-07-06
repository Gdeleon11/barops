import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

const lvl: Record<string, any> = { INFO: "primary", WARNING: "tertiary", CRITICAL: "error" };

export default async function Alertas() {
  const branchId = await currentBranchId();
  const [alerts, lowStock, offline] = await Promise.all([
    (prisma as any).alert.findMany({ where: { branchId }, orderBy: { createdAt: "desc" } }),
    prisma.inventoryItem.findMany({ where: { branchId } }),
    (prisma as any).device.findMany({ where: { branchId, status: "OFFLINE" } }),
  ]);
  const derived = [
    ...(lowStock as any[]).filter((i) => i.stock <= i.parLevel).map((i) => ({ id: "low-" + i.id, title: "Stock bajo", message: `${i.name}: ${i.stock} ${i.unit} (mín. ${i.parLevel})`, level: "WARNING", derived: true })),
    ...(offline as any[]).map((d: any) => ({ id: "dev-" + d.id, title: "Dispositivo caído", message: `${d.name} está OFFLINE`, level: "CRITICAL", derived: true })),
  ];

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{derived.length} alertas automáticas · {alerts.filter((a: any) => !a.acknowledged).length} manuales sin atender</p>
        <EntityForm
          endpoint="/api/x/alert"
          title="Nueva alerta"
          submitLabel="Publicar"
          fields={[
            { name: "title", label: "Título", required: true },
            { name: "message", label: "Mensaje", required: true, span: 2 },
            { name: "level", label: "Nivel", type: "select", options: [{ value: "INFO", label: "Info" }, { value: "WARNING", label: "Atención" }, { value: "CRITICAL", label: "Crítico" }], def: "WARNING" },
          ]}
        />
      </div>
      <div className="space-y-2">
        {derived.map((a) => (
          <Card key={a.id} className="flex items-center gap-3 p-3">
            <span className={`material-symbols-outlined ${a.level === "CRITICAL" ? "text-error" : "text-tertiary"}`}>{a.level === "CRITICAL" ? "error" : "warning"}</span>
            <div className="flex-1"><p className="text-sm font-medium text-on-surface">{a.title}</p><p className="text-xs text-on-surface-variant">{a.message}</p></div>
            <Badge tone="surface">Automática</Badge>
          </Card>
        ))}
        {alerts.map((a: any) => (
          <Card key={a.id} className={`flex items-center gap-3 p-3 ${a.acknowledged ? "opacity-50" : ""}`}>
            <span className={`material-symbols-outlined ${a.level === "CRITICAL" ? "text-error" : a.level === "WARNING" ? "text-tertiary" : "text-primary"}`}>notifications_active</span>
            <div className="flex-1"><p className="text-sm font-medium text-on-surface">{a.title}</p><p className="text-xs text-on-surface-variant">{a.message}</p></div>
            <Badge tone={lvl[a.level]}>{a.level}</Badge>
            {!a.acknowledged && <RowAction endpoint="/api/x/alert" method="PATCH" payload={{ id: a.id, acknowledged: true }} label="Atender" icon="check" tone="secondary" />}
          </Card>
        ))}
        {derived.length === 0 && alerts.length === 0 && <Card className="p-10 text-center text-on-surface-variant">Sin alertas. Todo en orden.</Card>}
      </div>
    </div>
  );
}
