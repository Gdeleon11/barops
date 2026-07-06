import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";

function tier(pts: number) {
  if (pts >= 500) return { name: "Platino", tone: "primary" as const };
  if (pts >= 250) return { name: "Oro", tone: "tertiary" as const };
  if (pts >= 100) return { name: "Plata", tone: "surface" as const };
  return { name: "Bronce", tone: "surface" as const };
}

export default async function PerfilCliente() {
  const branchId = await currentBranchId();
  const customers = await prisma.customer.findMany({ where: { branchId }, orderBy: { loyaltyPts: "desc" }, take: 20 });

  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Perfil y fidelización · {customers.length} clientes destacados</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(customers as any[]).map((c) => {
          const t = tier(c.loyaltyPts);
          const nextTier = c.loyaltyPts >= 500 ? 500 : c.loyaltyPts >= 250 ? 500 : c.loyaltyPts >= 100 ? 250 : 100;
          const pct = Math.min(100, (c.loyaltyPts / nextTier) * 100);
          return (
            <Card key={c.id} className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-lg font-semibold text-white">{c.name.slice(0, 1)}</div>
                <div className="flex-1">
                  <p className="flex items-center gap-2 font-medium text-on-surface">{c.name} {c.vip && <span className="material-symbols-outlined text-[16px] text-tertiary">star</span>}</p>
                  <p className="text-xs text-on-surface-variant">{c.phone || c.email || "Sin contacto"}</p>
                </div>
                <Badge tone={t.tone}>{t.name}</Badge>
              </div>
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs text-on-surface-variant"><span>{c.loyaltyPts} pts</span><span>Meta {nextTier}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full bg-secondary-container" style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-outline-variant/30 pt-3 text-center">
                <div><p className="font-display text-lg font-bold text-on-surface">{c.visits}</p><p className="text-[10px] uppercase text-on-surface-variant">Visitas</p></div>
                <div><p className="font-display text-sm font-bold text-secondary">{money(c.totalSpent)}</p><p className="text-[10px] uppercase text-on-surface-variant">Gasto total</p></div>
              </div>
              {c.notes && <p className="mt-3 rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">{c.notes}</p>}
            </Card>
          );
        })}
        {customers.length === 0 && <Card className="p-10 text-center text-on-surface-variant lg:col-span-3">Sin clientes. Agrégalos en CRM.</Card>}
      </div>
    </div>
  );
}
