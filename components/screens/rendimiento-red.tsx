import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, StatCard, Badge } from "@/components/ui";
import { RefreshButton } from "./_shared";

export default async function RendimientoRed() {
  const branchId = await currentBranchId();
  const devices = await (prisma as any).device.findMany({ where: { branchId }, orderBy: { latencyMs: "desc" } });
  const online = devices.filter((d: any) => d.status === "ONLINE");
  const avgLat = online.length ? online.reduce((s: number, d: any) => s + d.latencyMs, 0) / online.length : 0;
  const avgUp = devices.length ? devices.reduce((s: number, d: any) => s + d.uptime, 0) / devices.length : 0;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-3">
          <StatCard label="Latencia promedio" value={`${avgLat.toFixed(0)} ms`} icon="speed" tone={avgLat < 40 ? "secondary" : "tertiary"} />
          <StatCard label="Uptime promedio" value={`${avgUp.toFixed(1)}%`} icon="trending_up" tone="secondary" />
          <StatCard label="Nodos en línea" value={`${online.length}/${devices.length}`} icon="lan" tone="primary" />
        </div>
        <RefreshButton />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Dispositivo</th><th>Tipo</th><th className="text-center">Latencia</th><th className="text-center">Uptime</th><th className="w-1/4">Salud</th></tr></thead>
          <tbody>
            {devices.map((d: any) => {
              const health = d.status === "OFFLINE" ? 0 : Math.max(0, Math.min(100, d.uptime - d.latencyMs / 5));
              return (
                <tr key={d.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{d.name}</td>
                  <td className="text-on-surface-variant">{d.type}</td>
                  <td className="text-center text-on-surface">{d.latencyMs} ms</td>
                  <td className="text-center text-on-surface">{d.uptime.toFixed(1)}%</td>
                  <td><div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className={`h-full ${health > 80 ? "bg-secondary-container" : health > 50 ? "bg-tertiary-container" : "bg-error-container"}`} style={{ width: `${health}%` }} /></div></td>
                </tr>
              );
            })}
            {devices.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">Sin dispositivos monitoreados.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
