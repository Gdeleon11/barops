import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";
import { EntityForm } from "./_shared";

export default async function AperturaCaja() {
  const branchId = await currentBranchId();
  const open = await prisma.shift.findFirst({ where: { branchId, closedAt: null }, include: { user: true } });

  return (
    <div className="p-5 lg:p-6">
      {open ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">lock_open</span>
            <h3 className="font-display text-lg font-semibold text-on-surface">Turno abierto</h3>
            <Badge tone="secondary">Activo</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div><p className="text-xs uppercase text-on-surface-variant">Abierto por</p><p className="font-medium text-on-surface">{(open as any).user?.name}</p></div>
            <div><p className="text-xs uppercase text-on-surface-variant">Hora apertura</p><p className="font-medium text-on-surface">{new Date(open.openedAt).toLocaleString("es-MX", { timeStyle: "short", dateStyle: "short" })}</p></div>
            <div><p className="text-xs uppercase text-on-surface-variant">Fondo de caja</p><p className="font-medium text-secondary">{money(open.openingCash)}</p></div>
          </div>
          <p className="mt-4 text-sm text-on-surface-variant">Para cerrar el turno ve a "Cierre de Turno".</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">point_of_sale</span>
            <h3 className="font-display text-lg font-semibold text-on-surface">Abrir caja / turno</h3>
          </div>
          <p className="mb-4 text-sm text-on-surface-variant">Registra el fondo inicial de caja para comenzar el turno.</p>
          <EntityForm
            endpoint="/api/shifts"
            title="Abrir turno"
            submitLabel="Abrir turno"
            fields={[
              { name: "openingCash", label: "Fondo de caja (MXN)", type: "number", def: 2000, required: true },
              { name: "notes", label: "Notas de apertura", type: "textarea", span: 3, placeholder: "Denominaciones, novedades…" },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
