import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import { Card, Badge, StatCard } from "@/components/ui";
import { EntityForm, RowAction } from "./_shared";

export default async function MarketingWhatsapp() {
  const branchId = await currentBranchId();
  const campaigns = await (prisma as any).campaign.findMany({ where: { branchId }, orderBy: { createdAt: "desc" } });
  const sent = campaigns.reduce((s: number, c: any) => s + c.sent, 0);
  const delivered = campaigns.reduce((s: number, c: any) => s + c.delivered, 0);
  const opened = campaigns.reduce((s: number, c: any) => s + c.opened, 0);
  const openRate = delivered ? (opened / delivered) * 100 : 0;

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-3">
          <StatCard label="Mensajes enviados" value={sent.toLocaleString()} icon="send" tone="primary" />
          <StatCard label="Entregados" value={delivered.toLocaleString()} icon="done_all" tone="secondary" />
          <StatCard label="Tasa de apertura" value={`${openRate.toFixed(1)}%`} icon="drafts" tone="tertiary" />
        </div>
        <EntityForm
          endpoint="/api/x/campaign"
          title="Nueva campaña"
          submitLabel="Crear"
          fields={[
            { name: "name", label: "Nombre", required: true, placeholder: "Promo fin de semana" },
            { name: "audience", label: "Audiencia", type: "select", options: [{ value: "Todos", label: "Todos" }, { value: "VIP", label: "VIP" }, { value: "Frecuentes", label: "Frecuentes" }, { value: "Nuevos", label: "Nuevos" }], def: "Todos" },
            { name: "status", label: "Estado", type: "select", options: [{ value: "DRAFT", label: "Borrador" }, { value: "SCHEDULED", label: "Programada" }], def: "DRAFT" },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant"><th className="px-4 py-3">Campaña</th><th>Audiencia</th><th className="text-right">Enviados</th><th className="text-right">Entregados</th><th className="text-right">Abiertos</th><th className="text-center">Apertura</th><th>Estado</th></tr></thead>
          <tbody>
            {campaigns.map((c: any) => {
              const rate = c.delivered ? (c.opened / c.delivered) * 100 : 0;
              return (
                <tr key={c.id} className="border-b border-outline-variant/20">
                  <td className="px-4 py-3 font-medium text-on-surface">{c.name}</td>
                  <td className="text-on-surface-variant">{c.audience}</td>
                  <td className="text-right text-on-surface">{c.sent.toLocaleString()}</td>
                  <td className="text-right text-on-surface">{c.delivered.toLocaleString()}</td>
                  <td className="text-right text-on-surface">{c.opened.toLocaleString()}</td>
                  <td className="text-center"><Badge tone={rate >= 40 ? "secondary" : rate >= 20 ? "tertiary" : "surface"}>{rate.toFixed(0)}%</Badge></td>
                  <td><div className="flex items-center gap-2"><Badge tone={c.status === "SENT" ? "secondary" : "surface"}>{c.status}</Badge>{c.status !== "SENT" && <RowAction endpoint="/api/x/campaign" method="PATCH" payload={{ id: c.id, status: "SENT" }} label="Enviar" icon="send" tone="primary" />}</div></td>
                </tr>
              );
            })}
            {campaigns.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-on-surface-variant">Sin campañas. Crea la primera.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
