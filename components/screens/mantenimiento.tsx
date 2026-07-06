import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

export default async function Mantenimiento() {
  const branchId = await currentBranchId();
  const tasks = await (prisma as any).maintenanceTask.findMany({ where: { branchId }, orderBy: { dueDate: "asc" } });
  const now = Date.now();

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{tasks.filter((t: any) => t.status !== "DONE").length} tareas pendientes</p>
        <EntityForm
          endpoint="/api/x/maintenance"
          title="Nueva tarea"
          submitLabel="Programar"
          fields={[
            { name: "deviceName", label: "Equipo", required: true, placeholder: "Cafetera / Refrigerador…" },
            { name: "task", label: "Tarea", required: true, placeholder: "Limpieza de filtros" },
            { name: "dueDate", label: "Fecha límite", type: "datetime", required: true },
            { name: "assignee", label: "Responsable" },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Equipo</th><th>Tarea</th><th>Vence</th><th>Responsable</th><th>Estado</th><th className="text-right">Acción</th></tr></thead>
          <tbody>
            {tasks.map((t: any) => {
              const overdue = t.status !== "DONE" && new Date(t.dueDate).getTime() < now;
              return (
                <tr key={t.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{t.deviceName}</td>
                  <td className="text-on-surface-variant">{t.task}</td>
                  <td className="text-on-surface-variant">{new Date(t.dueDate).toLocaleDateString("es-MX")}</td>
                  <td className="text-on-surface-variant">{t.assignee || "—"}</td>
                  <td>{t.status === "DONE" ? <Badge tone="secondary">Hecho</Badge> : overdue ? <Badge tone="error">Vencido</Badge> : <Badge tone="tertiary">Pendiente</Badge>}</td>
                  <td className="text-right">{t.status !== "DONE" && <RowAction endpoint="/api/x/maintenance" method="PATCH" payload={{ id: t.id, status: "DONE" }} label="Completar" icon="check" tone="secondary" />}</td>
                </tr>
              );
            })}
            {tasks.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Sin tareas de mantenimiento.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
