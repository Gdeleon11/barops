import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, StatCard, money } from "@/components/ui";

export default async function AnaliticaClientes() {
  const branchId = await currentBranchId();
  const customers = await prisma.customer.findMany({ where: { branchId } });
  const list = customers as any[];
  const total = list.length;
  const vip = list.filter((c) => c.vip).length;
  const revenue = list.reduce((s, c) => s + c.totalSpent, 0);
  const avgSpend = total ? revenue / total : 0;
  const avgVisits = total ? list.reduce((s, c) => s + c.visits, 0) / total : 0;
  const buckets = [
    { label: "Nuevos (1-3)", n: list.filter((c) => c.visits <= 3).length },
    { label: "Recurrentes (4-10)", n: list.filter((c) => c.visits > 3 && c.visits <= 10).length },
    { label: "Frecuentes (11-25)", n: list.filter((c) => c.visits > 10 && c.visits <= 25).length },
    { label: "Embajadores (25+)", n: list.filter((c) => c.visits > 25).length },
  ];
  const top = [...list].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clientes" value={String(total)} icon="groups" tone="primary" />
        <StatCard label="VIP" value={`${vip} (${total ? Math.round((vip / total) * 100) : 0}%)`} icon="star" tone="tertiary" />
        <StatCard label="Gasto promedio" value={money(avgSpend)} icon="payments" tone="secondary" />
        <StatCard label="Visitas promedio" value={avgVisits.toFixed(1)} icon="repeat" tone="primary" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">Segmentación por lealtad</h4>
          <div className="space-y-2">
            {buckets.map((b) => {
              const pct = total ? (b.n / total) * 100 : 0;
              return (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-sm"><span className="text-on-surface">{b.label}</span><span className="text-on-surface-variant">{b.n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full bg-primary-container" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">Top 5 por gasto</h4>
          <div className="space-y-2">
            {top.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2">
                <span className="text-sm text-on-surface">{i + 1}. {c.name}</span><span className="text-sm font-medium text-secondary">{money(c.totalSpent)}</span>
              </div>
            ))}
            {top.length === 0 && <p className="text-sm text-on-surface-variant">Sin datos.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
