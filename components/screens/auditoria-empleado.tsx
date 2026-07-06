import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";

export default async function AuditoriaEmpleado() {
  const branchId = await currentBranchId();
  const users = await prisma.user.findMany({ where: { branchId }, include: { orders: { where: { status: "PAID" } }, shifts: true } });

  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Auditoría y desempeño individual</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {(users as any[]).map((u) => {
          const sales = u.orders.reduce((s: number, o: any) => s + o.total, 0);
          const tips = u.orders.reduce((s: number, o: any) => s + o.tip, 0);
          const hours = u.shifts.reduce((s: number, sh: any) => {
            const end = sh.closedAt ? new Date(sh.closedAt) : new Date();
            return s + (end.getTime() - new Date(sh.openedAt).getTime()) / 3.6e6;
          }, 0);
          return (
            <Card key={u.id} className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-white">{u.name.slice(0, 1)}</div>
                <div className="flex-1"><p className="font-medium text-on-surface">{u.name}</p><p className="text-xs text-on-surface-variant">{u.email}</p></div>
                <Badge tone="surface">{u.role}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 border-t border-outline-variant/30 pt-3 text-center">
                <div><p className="font-display text-base font-bold text-on-surface">{u.orders.length}</p><p className="text-[10px] uppercase text-on-surface-variant">Tickets</p></div>
                <div><p className="font-display text-sm font-bold text-secondary">{money(sales)}</p><p className="text-[10px] uppercase text-on-surface-variant">Ventas</p></div>
                <div><p className="font-display text-sm font-bold text-tertiary">{money(tips)}</p><p className="text-[10px] uppercase text-on-surface-variant">Propinas</p></div>
                <div><p className="font-display text-base font-bold text-on-surface">{hours.toFixed(0)}h</p><p className="text-[10px] uppercase text-on-surface-variant">Turnos</p></div>
              </div>
            </Card>
          );
        })}
        {users.length === 0 && <Card className="p-10 text-center text-on-surface-variant lg:col-span-2">Sin personal.</Card>}
      </div>
    </div>
  );
}
