import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard, money } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

const CATS = ["Tequila", "Mezcal", "Gin", "Whisky", "Ron", "Vodka", "Cerveza", "Vino", "Licores", "Otros"];

function catOf(item: any): string {
  if (item.category) return item.category;
  const n = (item.name || "").toLowerCase();
  if (n.includes("tequila")) return "Tequila";
  if (n.includes("mezcal")) return "Mezcal";
  if (n.includes("gin")) return "Gin";
  if (n.includes("whisky") || n.includes("whiskey") || n.includes("malt")) return "Whisky";
  if (n.includes("ron")) return "Ron";
  if (n.includes("vodka")) return "Vodka";
  if (n.includes("cerveza") || n.includes("ipa") || n.includes("lager") || n.includes("barril")) return "Cerveza";
  if (n.includes("vino") || n.includes("malbec") || n.includes("tinto") || n.includes("blanco")) return "Vino";
  return "Otros";
}

export default async function Botellas() {
  const branchId = await currentBranchId();
  const items = await prisma.inventoryItem.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  const bottles = (items as any[]).filter((i) => ["L", "botella", "barril"].includes(i.unit));
  const value = bottles.reduce((s, i) => s + i.stock * i.cost, 0);
  const low = bottles.filter((i) => i.stock <= i.parLevel).length;

  const groups = new Map<string, any[]>();
  for (const b of bottles) {
    const c = catOf(b);
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c)!.push(b);
  }
  const orderedCats = CATS.filter((c) => groups.has(c)).concat(
    Array.from(groups.keys()).filter((c) => !CATS.includes(c))
  );

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Botellas / barriles" value={String(bottles.length)} icon="liquor" tone="primary" />
          <StatCard label="Valor en barra" value={money(value)} icon="paid" tone="secondary" />
          <StatCard label="Por reponer" value={String(low)} icon="warning" tone={low ? "error" : "secondary"} />
        </div>
        <EntityForm
          endpoint="/api/inventory"
          title="Agregar botella"
          submitLabel="Agregar"
          fields={[
            { name: "name", label: "Producto", required: true, placeholder: "Tequila Reposado 1800", span: 2 },
            { name: "category", label: "Categoría", type: "select", options: CATS.map((c) => ({ value: c, label: c })), def: "Tequila" },
            { name: "unit", label: "Unidad", type: "select", options: [{ value: "L", label: "Litro" }, { value: "botella", label: "Botella" }, { value: "barril", label: "Barril" }], def: "L" },
            { name: "stock", label: "Existencia", type: "number", def: 1 },
            { name: "parLevel", label: "Mínimo", type: "number", def: 3 },
            { name: "cost", label: "Costo unit.", type: "number", def: 0 },
            { name: "supplier", label: "Proveedor" },
          ]}
        />
      </div>

      <div className="space-y-6">
        {orderedCats.map((cat) => {
          const list = groups.get(cat)!;
          const catValue = list.reduce((s, i) => s + i.stock * i.cost, 0);
          return (
            <div key={cat}>
              <h3 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]">liquor</span>
                {cat}
                <span className="text-xs font-normal text-on-surface-variant">· {list.length} · {money(catValue)}</span>
              </h3>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant">
                      <th className="px-4 py-2.5">Producto</th><th>Proveedor</th><th className="text-center">Existencia</th><th className="text-center">Mínimo</th><th className="text-right">Costo unit.</th><th className="text-center">Merma/servir</th><th className="text-right">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((i) => {
                      const servingsPerUnit = i.unit === "L" ? 20 : i.unit === "barril" ? 100 : 6;
                      const costPerServing = i.cost / servingsPerUnit;
                      return (
                        <tr key={i.id} className="border-b border-outline-variant/20">
                          <td className="px-4 py-2.5 font-medium text-on-surface">{i.name}</td>
                          <td className="text-on-surface-variant">{i.supplier || "—"}</td>
                          <td className={`text-center font-mono ${i.stock <= i.parLevel ? "text-error" : "text-on-surface"}`}>{i.stock} {i.unit}</td>
                          <td className="text-center text-on-surface-variant">{i.parLevel}</td>
                          <td className="text-right text-on-surface-variant">{money(i.cost)}</td>
                          <td className="text-center text-on-surface-variant">{money(costPerServing)}/porción</td>
                          <td className="text-right">
                            <div className="inline-flex gap-1">
                              <RowAction endpoint="/api/inventory" method="PATCH" payload={{ id: i.id, delta: -1 }} label="−" tone="surface" />
                              <RowAction endpoint="/api/inventory" method="PATCH" payload={{ id: i.id, delta: 1 }} label="+" tone="surface" />
                              <RowAction endpoint="/api/inventory" method="DELETE" payload={{ id: i.id }} label="" icon="delete" tone="error" confirm={`¿Eliminar ${i.name}?`} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          );
        })}
        {bottles.length === 0 && <Card className="p-10 text-center text-on-surface-variant">Sin botellas. Agrega la primera con "Agregar botella".</Card>}
      </div>
    </div>
  );
}
