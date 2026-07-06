import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { Card, Badge, StatCard, money } from "@/components/ui";
import { RowAction } from "./_shared";

export default async function Suscripcion() {
  const user = await currentUser();
  const [tenant, invoices] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: user.tenantId } }),
    (prisma as any).invoice.findMany({ where: { tenantId: user.tenantId }, orderBy: { createdAt: "desc" } }),
  ]);
  const due = invoices.filter((i: any) => i.status === "DUE").reduce((s: number, i: any) => s + i.amount, 0);

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Plan actual" value={tenant?.plan ?? "—"} icon="workspace_premium" tone="primary" />
        <StatCard label="Facturas" value={String(invoices.length)} icon="receipt_long" tone="secondary" />
        <StatCard label="Saldo pendiente" value={money(due)} icon="account_balance_wallet" tone={due > 0 ? "error" : "secondary"} />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Folio</th><th>Periodo</th><th className="text-right">Monto</th><th>Estado</th><th className="text-right">Acción</th></tr></thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-3 font-mono text-on-surface">{inv.number}</td>
                <td className="text-on-surface-variant">{inv.period}</td>
                <td className="text-right text-on-surface">{money(inv.amount)}</td>
                <td>{inv.status === "PAID" ? <Badge tone="secondary">Pagada</Badge> : <Badge tone="tertiary">Pendiente</Badge>}</td>
                <td className="text-right">{inv.status !== "PAID" && <RowAction endpoint="/api/x/invoice" method="PATCH" payload={{ id: inv.id, status: "PAID" }} label="Marcar pagada" icon="paid" tone="secondary" />}</td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">Sin facturas.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
