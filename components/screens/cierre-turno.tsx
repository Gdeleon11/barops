import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard, money } from "@/components/ui";
import { EntityForm } from "./_shared";

export default async function CierreTurno() {
  const branchId = await currentBranchId();
  const shift = await prisma.shift.findFirst({ where: { branchId, closedAt: null } });
  const since = shift?.openedAt ?? new Date();
  const paid = shift ? await prisma.order.findMany({ where: { branchId, status: "PAID", createdAt: { gte: since } }, select: { total: true } }) : [];
  const sales = paid.reduce((s: number, o: any) => s + o.total, 0);
  const expected = (shift?.openingCash ?? 0) + sales;
  const recent = await prisma.shift.findMany({ where: { branchId, closedAt: { not: null } }, orderBy: { closedAt: "desc" }, take: 6, include: { user: true } });

  return (
    <div className="p-5 lg:p-6">
      {shift ? (
        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-on-surface">Reconciliación y cierre</h3>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard label="Fondo inicial" value={money(shift.openingCash)} icon="savings" tone="primary" />
            <StatCard label="Ventas cobradas" value={money(sales)} icon="trending_up" tone="secondary" hint={`${paid.length} tickets`} />
            <StatCard label="Efectivo esperado" value={money(expected)} icon="account_balance_wallet" tone="tertiary" />
          </div>
          <p className="mb-3 text-sm text-on-surface-variant">Cuenta el efectivo físico y regístralo para calcular la diferencia.</p>
          <EntityForm
            endpoint="/api/shifts"
            method="PATCH"
            title="Cerrar turno"
            submitLabel="Cerrar y reconciliar"
            fields={[
              { name: "closingCash", label: "Efectivo contado (MXN)", type: "number", def: Math.round(expected), required: true },
              { name: "notes", label: "Observaciones de cierre", type: "textarea", span: 3 },
            ]}
          />
        </Card>
      ) : (
        <Card className="p-6 text-center text-on-surface-variant">No hay turno abierto para cerrar. Abre uno en "Apertura de Caja".</Card>
      )}

      <h4 className="mb-2 mt-6 font-display text-sm font-semibold text-on-surface">Turnos cerrados recientes</h4>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Responsable</th><th>Apertura</th><th>Cierre</th><th className="text-right">Ventas</th><th className="text-right">Contado</th><th className="text-right">Diferencia</th></tr></thead>
          <tbody>
            {recent.map((s: any) => {
              const diff = (s.closingCash ?? 0) - (s.openingCash + s.salesTotal);
              return (
                <tr key={s.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-2.5 font-medium text-on-surface">{s.user?.name}</td>
                  <td className="text-on-surface-variant">{new Date(s.openedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="text-on-surface-variant">{s.closedAt ? new Date(s.closedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                  <td className="text-right text-on-surface">{money(s.salesTotal)}</td>
                  <td className="text-right text-on-surface">{money(s.closingCash ?? 0)}</td>
                  <td className="text-right"><Badge tone={Math.abs(diff) < 1 ? "secondary" : "error"}>{money(diff)}</Badge></td>
                </tr>
              );
            })}
            {recent.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">Sin turnos cerrados.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
