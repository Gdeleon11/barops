import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard } from "@/components/ui";
import { RowAction } from "./_shared";

const LATEST = "2.4.1";

export default async function Firmware() {
  const branchId = await currentBranchId();
  const devices = await (prisma as any).device.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  const outdated = devices.filter((d: any) => d.firmware !== LATEST);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex gap-3">
        <StatCard label="Versión estable" value={LATEST} icon="verified" tone="secondary" />
        <StatCard label="Actualizados" value={`${devices.length - outdated.length}/${devices.length}`} icon="system_update" tone="primary" />
        <StatCard label="Pendientes" value={String(outdated.length)} icon="update" tone={outdated.length ? "tertiary" : "secondary"} />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Dispositivo</th><th>Tipo</th><th>Versión actual</th><th>Estado</th><th className="text-right">Acción</th></tr></thead>
          <tbody>
            {devices.map((d: any) => {
              const up = d.firmware === LATEST;
              return (
                <tr key={d.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{d.name}</td>
                  <td className="text-on-surface-variant">{d.type}</td>
                  <td className="font-mono text-on-surface-variant">{d.firmware}</td>
                  <td>{up ? <Badge tone="secondary">Al día</Badge> : <Badge tone="tertiary">Desactualizado</Badge>}</td>
                  <td className="text-right">{!up && <RowAction endpoint="/api/x/device" method="PATCH" payload={{ id: d.id, firmware: LATEST }} label={`Actualizar a ${LATEST}`} icon="system_update_alt" tone="primary" />}</td>
                </tr>
              );
            })}
            {devices.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">Sin dispositivos.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
