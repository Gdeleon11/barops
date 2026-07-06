import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

export default async function Waitlist() {
  const branchId = await currentBranchId();
  const entries = await (prisma as any).waitlistEntry.findMany({
    where: { branchId, status: "WAITING" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Badge tone="primary">{entries.length} en espera</Badge>
        <EntityForm
          endpoint="/api/x/waitlist"
          title="Agregar a lista"
          submitLabel="Agregar"
          fields={[
            { name: "name", label: "Nombre", required: true, placeholder: "Cliente" },
            { name: "partySize", label: "Personas", type: "number", def: 2 },
            { name: "phone", label: "Teléfono", placeholder: "Opcional" },
            { name: "quotedWait", label: "Espera (min)", type: "number", def: 15 },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant">
              <th className="px-4 py-3">#</th><th>Cliente</th><th className="text-center">Pax</th><th>Teléfono</th><th className="text-center">Espera</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: any, i: number) => {
              const waited = Math.floor((Date.now() - new Date(e.createdAt).getTime()) / 60000);
              return (
                <tr key={e.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-mono text-on-surface-variant">{i + 1}</td>
                  <td className="font-medium text-on-surface">{e.name}</td>
                  <td className="text-center text-on-surface">{e.partySize}</td>
                  <td className="text-on-surface-variant">{e.phone || "—"}</td>
                  <td className="text-center">
                    <Badge tone={waited >= e.quotedWait ? "error" : "surface"}>{waited}/{e.quotedWait} min</Badge>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-2">
                      <RowAction endpoint="/api/x/waitlist" method="PATCH" payload={{ id: e.id, status: "SEATED" }} label="Sentar" icon="chair" tone="secondary" />
                      <RowAction endpoint="/api/x/waitlist" method="PATCH" payload={{ id: e.id, status: "CANCELLED" }} label="Quitar" icon="close" tone="error" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Nadie en espera.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
