import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

const st: Record<string, any> = { ONLINE: "secondary", WARNING: "tertiary", OFFLINE: "error" };

export default async function Terminales() {
  const branchId = await currentBranchId();
  const devices = await (prisma as any).device.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  const online = devices.filter((d: any) => d.status === "ONLINE").length;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-3">
          <StatCard label="Dispositivos" value={String(devices.length)} icon="devices" tone="primary" />
          <StatCard label="En línea" value={`${online}/${devices.length}`} icon="wifi" tone="secondary" />
        </div>
        <EntityForm
          endpoint="/api/x/device"
          title="Agregar dispositivo"
          submitLabel="Agregar"
          fields={[
            { name: "name", label: "Nombre", required: true, placeholder: "POS Barra 1" },
            { name: "type", label: "Tipo", type: "select", options: [{ value: "POS", label: "POS" }, { value: "KDS", label: "KDS" }, { value: "PRINTER", label: "Impresora" }, { value: "ROUTER", label: "Router" }, { value: "AP", label: "Access Point" }, { value: "TABLET", label: "Tablet" }], def: "POS" },
            { name: "ip", label: "IP", placeholder: "192.168.1.20" },
            { name: "firmware", label: "Firmware", def: "2.4.1" },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Dispositivo</th><th>Tipo</th><th>IP</th><th>Firmware</th><th className="text-center">Latencia</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
          <tbody>
            {devices.map((d: any) => (
              <tr key={d.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-3 font-medium text-on-surface">{d.name}</td>
                <td className="text-on-surface-variant">{d.type}</td>
                <td className="font-mono text-on-surface-variant">{d.ip || "—"}</td>
                <td className="text-on-surface-variant">{d.firmware}</td>
                <td className="text-center text-on-surface">{d.latencyMs} ms</td>
                <td><Badge tone={st[d.status]}>{d.status}</Badge></td>
                <td className="text-right">
                  <div className="inline-flex gap-2">
                    <RowAction endpoint="/api/x/device" method="PATCH" payload={{ id: d.id, status: d.status === "ONLINE" ? "OFFLINE" : "ONLINE" }} label={d.status === "ONLINE" ? "Apagar" : "Encender"} icon="power_settings_new" tone={d.status === "ONLINE" ? "error" : "secondary"} />
                    <RowAction endpoint="/api/x/device" method="DELETE" payload={{ id: d.id }} label="" icon="delete" tone="surface" confirm="¿Eliminar dispositivo?" />
                  </div>
                </td>
              </tr>
            ))}
            {devices.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-on-surface-variant">Sin dispositivos.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
