import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard, money } from "@/components/ui";
import { RowAction } from "./_shared";

export default async function Botellas() {
  const branchId = await currentBranchId();
  const items = await prisma.inventoryItem.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  const bottles = (items as any[]).filter((i) => ["L", "botella", "barril"].includes(i.unit));
  const value = bottles.reduce((s, i) => s + i.stock * i.cost, 0);
  const low = bottles.filter((i) => i.stock <= i.parLevel).length;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Botellas / barriles" value={String(bottles.length)} icon="liquor" tone="primary" />
        <StatCard label="Valor en barra" value={money(value)} icon="paid" tone="secondary" />
        <StatCard label="Por reponer" value={String(low)} icon="warning" tone="error" />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Producto</th><th>Proveedor</th><th className="text-center">Existencia</th><th className="text-center">Mínimo</th><th className="text-right">Costo unit.</th><th className="text-center">Merma/servir</th><th className="text-right">Ajuste</th></tr></thead>
          <tbody>
            {bottles.map((i) => {
              const servingsPerUnit = i.unit === "L" ? 20 : i.unit === "barril" ? 100 : 6;
              const costPerServing = i.cost / servingsPerUnit;
              const lowFlag = i.stock <= i.parLevel;
              return (
                <tr key={i.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{i.name}</td>
                  <td className="text-on-surface-variant">{i.supplier || "—"}</td>
                  <td className="text-center font-mono text-on-surface">{i.stock} {i.unit}</td>
                  <td className="text-center text-on-surface-variant">{i.parLevel}</td>
                  <td className="text-right text-on-surface-variant">{money(i.cost)}</td>
                  <td className="text-center text-on-surface-variant">{money(costPerServing)}/porción</td>
                  <td className="text-right">
                    <div className="inline-flex gap-1">
                      <RowAction endpoint="/api/inventory" method="PATCH" payload={{ id: i.id, delta: -1 }} label="−" tone="surface" />
                      <RowAction endpoint="/api/inventory" method="PATCH" payload={{ id: i.id, delta: 1 }} label="+" tone="surface" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {bottles.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-on-surface-variant">Sin botellas registradas en inventario.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
