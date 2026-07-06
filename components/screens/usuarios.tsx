import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

export default async function Usuarios() {
  const branchId = await currentBranchId();
  const users = await prisma.user.findMany({ where: { branchId }, orderBy: { name: "asc" } });

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">{users.length} usuarios</p>
        <EntityForm
          endpoint="/api/x/user"
          title="Nuevo usuario"
          submitLabel="Crear"
          fields={[
            { name: "name", label: "Nombre", required: true },
            { name: "email", label: "Email", required: true },
            { name: "role", label: "Rol", type: "select", options: [
              { value: "OWNER", label: "Dueño" }, { value: "ADMIN", label: "Admin" }, { value: "MANAGER", label: "Gerente" },
              { value: "WAITER", label: "Mesero" }, { value: "BARTENDER", label: "Bartender" }, { value: "KITCHEN", label: "Cocina" }, { value: "CASHIER", label: "Cajero" },
            ], def: "WAITER" },
            { name: "password", label: "Contraseña", def: "cambiar123" },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th className="text-right">Acción</th></tr></thead>
          <tbody>
            {(users as any[]).map((u) => (
              <tr key={u.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-3 font-medium text-on-surface">{u.name}</td>
                <td className="text-on-surface-variant">{u.email}</td>
                <td><Badge tone="primary">{u.role}</Badge></td>
                <td>{u.active ? <Badge tone="secondary">Activo</Badge> : <Badge tone="error">Inactivo</Badge>}</td>
                <td className="text-right"><RowAction endpoint="/api/x/user" method="PATCH" payload={{ id: u.id, active: !u.active }} label={u.active ? "Desactivar" : "Activar"} icon="toggle_on" tone={u.active ? "error" : "secondary"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
