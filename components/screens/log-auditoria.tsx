import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { RefreshButton } from "./_shared";

const lvl: Record<string, any> = { INFO: "surface", WARNING: "tertiary", CRITICAL: "error" };

export default async function LogAuditoria() {
  const branchId = await currentBranchId();
  const logs = await (prisma as any).auditLog.findMany({ where: { branchId }, orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">Registro de auditoría de seguridad · {logs.length} eventos</p>
        <RefreshButton />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Fecha</th><th>Actor</th><th>Acción</th><th>Objetivo</th><th>Severidad</th></tr></thead>
          <tbody>
            {logs.map((l: any) => (
              <tr key={l.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-2.5 text-on-surface-variant">{new Date(l.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "medium" })}</td>
                <td className="font-medium text-on-surface">{l.actor}</td>
                <td className="text-on-surface-variant">{l.action}</td>
                <td className="text-on-surface-variant">{l.target || "—"}</td>
                <td><Badge tone={lvl[l.severity]}>{l.severity}</Badge></td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">Sin eventos registrados.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
