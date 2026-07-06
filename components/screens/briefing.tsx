import { prisma } from "@/lib/prisma";
import { currentBranchId, currentUser } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { EntityForm } from "./_shared";

export default async function Briefing() {
  const branchId = await currentBranchId();
  const user = await currentUser();
  const notes = await (prisma as any).auditLog.findMany({
    where: { branchId, action: "BRIEFING" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-on-surface">Bitácora de turno</h3>
        <EntityForm
          endpoint="/api/x/audit"
          title="Nueva nota"
          submitLabel="Publicar"
          fields={[
            { name: "detail", label: "Nota / novedad del turno", type: "textarea", span: 4, required: true, placeholder: "Reservas VIP, 86 de productos, incidencias…" },
            { name: "severity", label: "Prioridad", type: "select", options: [{ value: "INFO", label: "Info" }, { value: "WARNING", label: "Atención" }, { value: "CRITICAL", label: "Crítico" }], def: "INFO" },
          ]}
          transform={(v) => ({ ...v, actor: user.name ?? "Staff", action: "BRIEFING", target: "Turno" })}
        />
      </div>
      <div className="space-y-3">
        {notes.map((n: any) => (
          <Card key={n.id} className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">{n.actor}</span>
              <div className="flex items-center gap-2">
                <Badge tone={n.severity === "CRITICAL" ? "error" : n.severity === "WARNING" ? "tertiary" : "surface"}>{n.severity}</Badge>
                <span className="text-xs text-on-surface-variant">{new Date(n.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant">{n.detail}</p>
          </Card>
        ))}
        {notes.length === 0 && <Card className="p-10 text-center text-on-surface-variant">Sin notas de turno. Publica la primera.</Card>}
      </div>
    </div>
  );
}
