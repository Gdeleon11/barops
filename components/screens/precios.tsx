import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

export default async function PreciosHappyHour() {
  const branchId = await currentBranchId();
  const rules = await (prisma as any).priceRule.findMany({ where: { branchId }, orderBy: { startHour: "asc" } });

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{rules.filter((r: any) => r.active).length} reglas activas</p>
        <EntityForm
          endpoint="/api/x/pricerule"
          title="Nueva regla"
          submitLabel="Crear"
          fields={[
            { name: "name", label: "Nombre", required: true, placeholder: "Happy Hour 2x1" },
            { name: "categoryName", label: "Categoría", placeholder: "Cócteles" },
            { name: "discountPct", label: "% descuento", type: "number", def: 20 },
            { name: "startHour", label: "Desde (h)", type: "number", def: 17 },
            { name: "endHour", label: "Hasta (h)", type: "number", def: 20 },
            { name: "days", label: "Días", def: "L-V" },
          ]}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map((r: any) => (
          <Card key={r.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-on-surface">{r.name}</p>
              <Badge tone={r.active ? "secondary" : "surface"}>{r.active ? "Activa" : "Inactiva"}</Badge>
            </div>
            <p className="text-sm text-on-surface-variant">{r.categoryName || "Todas las categorías"}</p>
            <p className="mt-1 font-display text-2xl font-bold text-tertiary">-{r.discountPct}%</p>
            <p className="mt-1 text-xs text-on-surface-variant">{r.days} · {r.startHour}:00–{r.endHour}:00</p>
            <div className="mt-3">
              <RowAction endpoint="/api/x/pricerule" method="PATCH" payload={{ id: r.id, active: !r.active }} label={r.active ? "Desactivar" : "Activar"} icon="power_settings_new" tone={r.active ? "error" : "secondary"} />
            </div>
          </Card>
        ))}
        {rules.length === 0 && <Card className="p-10 text-center text-on-surface-variant lg:col-span-3">Sin reglas de precio. Crea un Happy Hour.</Card>}
      </div>
    </div>
  );
}
