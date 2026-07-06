import { Card } from "@/components/ui";
import { EntityForm } from "./_shared";

export default function Invitacion() {
  return (
    <div className="p-5 lg:p-6">
      <Card className="max-w-2xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person_add</span>
          <h3 className="font-display text-lg font-semibold text-on-surface">Invitar usuario al equipo</h3>
        </div>
        <p className="mb-4 text-sm text-on-surface-variant">
          Crea la cuenta con un rol y una contraseña temporal. El usuario podrá iniciar sesión de inmediato y cambiarla después.
        </p>
        <EntityForm
          endpoint="/api/x/user"
          title="Enviar invitación"
          submitLabel="Crear cuenta"
          fields={[
            { name: "name", label: "Nombre completo", required: true, span: 2 },
            { name: "email", label: "Correo", required: true, span: 2 },
            { name: "role", label: "Rol", type: "select", options: [
              { value: "MANAGER", label: "Gerente" }, { value: "WAITER", label: "Mesero" },
              { value: "BARTENDER", label: "Bartender" }, { value: "KITCHEN", label: "Cocina" },
              { value: "CASHIER", label: "Cajero" }, { value: "ADMIN", label: "Admin" },
            ], def: "WAITER" },
            { name: "password", label: "Contraseña temporal", def: "bienvenido123" },
          ]}
        />
      </Card>
    </div>
  );
}
