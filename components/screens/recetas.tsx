import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";
import { EntityForm } from "./_shared";

export default async function Recetas() {
  const branchId = await currentBranchId();
  const recipes = await (prisma as any).recipe.findMany({ where: { branchId }, include: { items: true }, orderBy: { name: "asc" } });

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{recipes.length} recetas / escandallos</p>
        <EntityForm
          endpoint="/api/x/recipe"
          title="Nueva receta"
          submitLabel="Crear"
          fields={[
            { name: "name", label: "Nombre", required: true, placeholder: "Margarita Clásica" },
            { name: "yield", label: "Rendimiento", placeholder: "1 copa" },
            { name: "salePrice", label: "Precio venta", type: "number", def: 0 },
          ]}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {recipes.map((r: any) => {
          const cost = r.items.reduce((s: number, it: any) => s + it.cost, 0);
          const margin = r.salePrice ? ((r.salePrice - cost) / r.salePrice) * 100 : 0;
          const foodCostPct = r.salePrice ? (cost / r.salePrice) * 100 : 0;
          return (
            <Card key={r.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-on-surface">{r.name}</p>
                  <p className="text-xs text-on-surface-variant">{r.yield || "—"}</p>
                </div>
                <Badge tone={foodCostPct <= 30 ? "secondary" : foodCostPct <= 40 ? "tertiary" : "error"}>
                  Food cost {foodCostPct.toFixed(0)}%
                </Badge>
              </div>
              <ul className="mb-2 space-y-1 border-y border-outline-variant/30 py-2">
                {r.items.map((it: any) => (
                  <li key={it.id} className="flex justify-between text-sm text-on-surface-variant">
                    <span>{it.ingredient} · {it.qty} {it.unit}</span><span>{money(it.cost)}</span>
                  </li>
                ))}
                {r.items.length === 0 && <li className="text-xs text-on-surface-variant">Sin ingredientes cargados.</li>}
              </ul>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Costo {money(cost)} · Venta {money(r.salePrice)}</span>
                <span className="font-medium text-secondary">Margen {margin.toFixed(0)}%</span>
              </div>
            </Card>
          );
        })}
        {recipes.length === 0 && <Card className="p-10 text-center text-on-surface-variant lg:col-span-2">Sin recetas.</Card>}
      </div>
    </div>
  );
}
