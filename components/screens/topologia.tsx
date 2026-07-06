import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";

const icon: Record<string, string> = { ROUTER: "router", AP: "wifi", POS: "point_of_sale", KDS: "monitor", PRINTER: "print", TABLET: "tablet" };
const st: Record<string, any> = { ONLINE: "secondary", WARNING: "tertiary", OFFLINE: "error" };

export default async function Topologia() {
  const branchId = await currentBranchId();
  const devices = await (prisma as any).device.findMany({ where: { branchId }, orderBy: { type: "asc" } });
  const routers = devices.filter((d: any) => d.type === "ROUTER");
  const aps = devices.filter((d: any) => d.type === "AP");
  const endpoints = devices.filter((d: any) => !["ROUTER", "AP"].includes(d.type));

  const Node = ({ d }: { d: any }) => (
    <div className="flex flex-col items-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${d.status === "ONLINE" ? "border-secondary/50 bg-secondary-container/10" : d.status === "OFFLINE" ? "border-error/50 bg-error-container/20" : "border-tertiary/50 bg-tertiary-container/10"}`}>
        <span className="material-symbols-outlined text-on-surface">{icon[d.type] ?? "lan"}</span>
      </div>
      <span className="mt-1 text-xs text-on-surface">{d.name}</span>
      <Badge tone={st[d.status]}>{d.status}</Badge>
    </div>
  );

  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Topología de red · {devices.length} nodos</p>
      <Card className="p-6">
        <div className="flex flex-col items-center gap-8">
          <div className="flex justify-center gap-6">{routers.map((d: any) => <Node key={d.id} d={d} />)}{routers.length === 0 && <p className="text-sm text-on-surface-variant">Sin router registrado</p>}</div>
          <div className="h-8 w-px bg-outline-variant/50" />
          <div className="flex flex-wrap justify-center gap-6">{aps.map((d: any) => <Node key={d.id} d={d} />)}</div>
          <div className="h-8 w-px bg-outline-variant/50" />
          <div className="flex flex-wrap justify-center gap-5">{endpoints.map((d: any) => <Node key={d.id} d={d} />)}</div>
        </div>
      </Card>
    </div>
  );
}
