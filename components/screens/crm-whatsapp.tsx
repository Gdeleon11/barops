import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, money } from "@/components/ui";
import { EntityForm } from "./_shared";

export default async function CrmWhatsapp() {
  const branchId = await currentBranchId();
  const customers = await prisma.customer.findMany({ where: { branchId }, orderBy: { totalSpent: "desc" } });
  const list = customers as any[];
  const segments = [
    { key: "VIP", n: list.filter((c) => c.vip).length, icon: "star", tone: "tertiary" as const },
    { key: "Frecuentes", n: list.filter((c) => c.visits > 10).length, icon: "repeat", tone: "primary" as const },
    { key: "Nuevos", n: list.filter((c) => c.visits <= 3).length, icon: "person_add", tone: "secondary" as const },
    { key: "Con teléfono", n: list.filter((c) => c.phone).length, icon: "call", tone: "surface" as const },
  ];

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-on-surface">CRM + Marketing WhatsApp</h3>
        <EntityForm
          endpoint="/api/x/campaign"
          title="Enviar campaña"
          submitLabel="Lanzar"
          fields={[
            { name: "name", label: "Mensaje/Campaña", required: true, placeholder: "2x1 en cócteles hoy 🍸" },
            { name: "audience", label: "Segmento", type: "select", options: [{ value: "Todos", label: "Todos" }, { value: "VIP", label: "VIP" }, { value: "Frecuentes", label: "Frecuentes" }, { value: "Nuevos", label: "Nuevos" }], def: "VIP" },
          ]}
          transform={(v) => ({ ...v, channel: "WhatsApp", status: "SENT" })}
        />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {segments.map((s) => (
          <Card key={s.key} className="flex items-center gap-3 p-4">
            <span className={`material-symbols-outlined rounded-lg p-2 text-primary bg-primary-container/20`}>{s.icon}</span>
            <div><p className="font-display text-xl font-bold text-on-surface">{s.n}</p><p className="text-xs text-on-surface-variant">{s.key}</p></div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Cliente</th><th>Teléfono</th><th className="text-center">Visitas</th><th className="text-right">Gasto</th><th>Segmento</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-outline-variant/20">
                <td className="px-4 py-2.5 font-medium text-on-surface">{c.name}</td>
                <td className="text-on-surface-variant">{c.phone || "—"}</td>
                <td className="text-center text-on-surface">{c.visits}</td>
                <td className="text-right text-on-surface">{money(c.totalSpent)}</td>
                <td>{c.vip ? <Badge tone="tertiary">VIP</Badge> : c.visits > 10 ? <Badge tone="primary">Frecuente</Badge> : <Badge tone="surface">Regular</Badge>}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">Sin clientes.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
