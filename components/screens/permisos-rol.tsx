import { Card, Badge } from "@/components/ui";

const ROLES = ["OWNER", "MANAGER", "WAITER", "BARTENDER", "KITCHEN", "CASHIER"];
const PERMS: { key: string; label: string; roles: string[] }[] = [
  { key: "pos", label: "Operar POS / cobrar", roles: ["OWNER", "MANAGER", "WAITER", "BARTENDER", "CASHIER"] },
  { key: "kds", label: "Ver KDS / BDS", roles: ["OWNER", "MANAGER", "KITCHEN", "BARTENDER"] },
  { key: "inv", label: "Editar inventario", roles: ["OWNER", "MANAGER"] },
  { key: "cash", label: "Abrir/cerrar caja", roles: ["OWNER", "MANAGER", "CASHIER"] },
  { key: "reports", label: "Ver reportes financieros", roles: ["OWNER", "MANAGER"] },
  { key: "staff", label: "Gestionar personal", roles: ["OWNER", "MANAGER"] },
  { key: "users", label: "Administrar usuarios", roles: ["OWNER"] },
  { key: "prices", label: "Configurar precios", roles: ["OWNER", "MANAGER"] },
  { key: "devices", label: "Administrar dispositivos", roles: ["OWNER"] },
];

export default function PermisosRol() {
  return (
    <div className="p-5 lg:p-6">
      <p className="mb-4 text-sm text-on-surface-variant">Matriz de permisos efectivos por rol</p>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/40 text-xs uppercase text-on-surface-variant">
              <th className="px-4 py-3 text-left">Permiso</th>
              {ROLES.map((r) => <th key={r} className="px-2 py-3 text-center">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((p) => (
              <tr key={p.key} className="border-b border-outline-variant/20">
                <td className="px-4 py-3 font-medium text-on-surface">{p.label}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-2 py-3 text-center">
                    {p.roles.includes(r)
                      ? <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
                      : <span className="material-symbols-outlined text-[18px] text-outline-variant">remove</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-xs text-on-surface-variant">Estos permisos reflejan las capacidades aplicadas en la plataforma según el rol asignado a cada usuario.</p>
    </div>
  );
}
