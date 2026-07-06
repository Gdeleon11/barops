import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { PageHeader, Card, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const roleTone: Record<string, string> = {
  OWNER: "primary", ADMIN: "primary", MANAGER: "tertiary",
  WAITER: "secondary", BARTENDER: "secondary", KITCHEN: "surface", CASHIER: "surface",
};
const roleLabel: Record<string, string> = {
  OWNER: "Dueño", ADMIN: "Admin", MANAGER: "Gerente", WAITER: "Mesero",
  BARTENDER: "Bartender", KITCHEN: "Cocina", CASHIER: "Cajero",
};

export default async function StaffPage() {
  const branchId = await currentBranchId();
  const users = await prisma.user.findMany({ where: { branchId }, orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Personal y Desempeño" subtitle={`${users.length} miembros del equipo`} icon="badge" />
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
        {users.map((u: any) => (
          <Card key={u.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-lg font-semibold text-white">
                {u.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface">{u.name}</p>
                <p className="text-xs text-on-surface-variant">{u.email}</p>
              </div>
              <Badge tone={roleTone[u.role] ?? "surface"}>{roleLabel[u.role] ?? u.role}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className={`material-symbols-outlined text-[16px] ${u.active ? "text-secondary" : "text-error"}`}>
                  {u.active ? "check_circle" : "cancel"}
                </span>
                {u.active ? "Activo" : "Inactivo"}
              </span>
              <span>Desde {new Date(u.createdAt).toLocaleDateString("es-MX")}</span>
            </div>
          </Card>
        ))}
        {users.length === 0 && <Card className="p-10 text-center text-on-surface-variant">Sin personal registrado.</Card>}
      </div>
    </div>
  );
}
