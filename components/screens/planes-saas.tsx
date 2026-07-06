import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { RowAction } from "./_shared";

const PLANS = [
  { key: "FREE", name: "Free", price: "$0", features: ["1 sucursal", "POS básico", "Hasta 3 usuarios", "Reportes básicos"] },
  { key: "PRO", name: "Pro", price: "$1,499/mes", features: ["Multi-sucursal", "KDS/BDS", "CRM + WhatsApp", "Inventario y recetas", "Usuarios ilimitados"] },
  { key: "ENTERPRISE", name: "Enterprise", price: "A medida", features: ["Todo lo de Pro", "Topología de red", "Firmware OTA", "Auditoría avanzada", "Soporte dedicado"] },
];

export default async function PlanesSaas() {
  const user = await currentUser();
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  const current = tenant?.plan ?? "PRO";

  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Elige el plan para {tenant?.name}. Plan actual: <span className="text-primary">{current}</span></p>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const active = p.key === current;
          return (
            <Card key={p.key} className={`flex flex-col p-6 ${active ? "border-2 border-primary neon-glow-primary" : ""}`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-on-surface">{p.name}</h3>
                {active && <Badge tone="primary">Actual</Badge>}
              </div>
              <p className="mb-4 font-display text-2xl font-bold text-primary">{p.price}</p>
              <ul className="mb-6 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-secondary">check</span> {f}
                  </li>
                ))}
              </ul>
              {active ? (
                <button disabled className="rounded-lg bg-surface-container py-2.5 text-sm font-semibold text-on-surface-variant">Plan activo</button>
              ) : (
                <RowAction endpoint="/api/tenant" method="PATCH" payload={{ plan: p.key }} label={`Cambiar a ${p.name}`} icon="upgrade" tone="primary" />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
