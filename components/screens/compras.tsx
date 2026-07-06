import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

const tone: Record<string, any> = { DRAFT: "surface", SENT: "tertiary", RECEIVED: "secondary" };
const label: Record<string, string> = { DRAFT: "Borrador", SENT: "Enviada", RECEIVED: "Recibida" };

export default async function Compras() {
  const branchId = await currentBranchId();
  const [orders, suppliers] = await Promise.all([
    (prisma as any).purchaseOrder.findMany({ where: { branchId }, include: { items: true }, orderBy: { createdAt: "desc" } }),
    (prisma as any).supplier.findMany({ where: { branchId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 p-5 lg:p-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-on-surface">Órdenes de compra</h3>
          <EntityForm
            endpoint="/api/x/purchase"
            title="Nueva orden"
            submitLabel="Crear orden"
            fields={[
              { name: "supplierName", label: "Proveedor", required: true, placeholder: "Casa Sauza" },
              { name: "status", label: "Estado", type: "select", options: [{ value: "DRAFT", label: "Borrador" }, { value: "SENT", label: "Enviada" }], def: "DRAFT" },
              { name: "total", label: "Monto estimado", type: "number", def: 0 },
            ]}
          />
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Folio</th><th>Proveedor</th><th>Fecha</th><th className="text-right">Total</th><th>Estado</th><th className="text-right">Acción</th></tr></thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-mono text-on-surface">#{o.number}</td>
                  <td className="text-on-surface">{o.supplierName}</td>
                  <td className="text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString("es-MX")}</td>
                  <td className="text-right text-on-surface">{money(o.total)}</td>
                  <td><Badge tone={tone[o.status]}>{label[o.status] ?? o.status}</Badge></td>
                  <td className="text-right">
                    <div className="inline-flex gap-2">
                      {o.status !== "RECEIVED" && <RowAction endpoint="/api/x/purchase" method="PATCH" payload={{ id: o.id, status: "RECEIVED" }} label="Marcar recibida" icon="inventory" tone="secondary" />}
                      <RowAction endpoint="/api/x/purchase" method="DELETE" payload={{ id: o.id }} label="" icon="delete" tone="error" confirm={`¿Eliminar orden #${o.number}?`} />
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Sin órdenes de compra.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-on-surface">Proveedores</h3>
          <EntityForm
            endpoint="/api/x/supplier"
            title="Nuevo proveedor"
            submitLabel="Guardar"
            fields={[
              { name: "name", label: "Nombre", required: true },
              { name: "contact", label: "Contacto" },
              { name: "phone", label: "Teléfono" },
              { name: "category", label: "Categoría", placeholder: "Licores, Alimentos…" },
            ]}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s: any) => (
            <Card key={s.id} className="p-4">
              <p className="font-medium text-on-surface">{s.name}</p>
              <p className="text-xs text-on-surface-variant">{s.category || "General"}</p>
              <p className="mt-2 text-sm text-on-surface-variant">{s.contact || "—"} · {s.phone || "—"}</p>
              <div className="mt-2"><RowAction endpoint="/api/x/supplier" method="DELETE" payload={{ id: s.id }} label="Eliminar" icon="delete" tone="error" confirm={`¿Eliminar proveedor ${s.name}?`} /></div>
            </Card>
          ))}
          {suppliers.length === 0 && <Card className="p-8 text-center text-on-surface-variant lg:col-span-3">Sin proveedores.</Card>}
        </div>
      </div>
    </div>
  );
}
