import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";

export default async function TurnosAsistencia() {
  const branchId = await currentBranchId();
  const shifts = await prisma.shift.findMany({ where: { branchId }, orderBy: { openedAt: "desc" }, take: 30, include: { user: true } });

  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Registro de turnos y asistencia · {shifts.length} registros</p>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Empleado</th><th>Entrada</th><th>Salida</th><th className="text-center">Horas</th><th className="text-right">Ventas turno</th><th>Estado</th></tr></thead>
          <tbody>
            {(shifts as any[]).map((s) => {
              const end = s.closedAt ? new Date(s.closedAt) : new Date();
              const hours = ((end.getTime() - new Date(s.openedAt).getTime()) / 3.6e6);
              return (
                <tr key={s.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{s.user?.name}</td>
                  <td className="text-on-surface-variant">{new Date(s.openedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="text-on-surface-variant">{s.closedAt ? new Date(s.closedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                  <td className="text-center text-on-surface">{hours.toFixed(1)} h</td>
                  <td className="text-right text-on-surface">{money(s.salesTotal)}</td>
                  <td>{s.closedAt ? <Badge tone="surface">Cerrado</Badge> : <Badge tone="secondary">En turno</Badge>}</td>
                </tr>
              );
            })}
            {shifts.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Sin turnos registrados. Abre uno en "Apertura de Caja".</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
