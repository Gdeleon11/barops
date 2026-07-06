"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card, Badge } from "@/components/ui";

type R = { id: string; guestName: string; partySize: number; dateTime: string; status: string; tableName: string; notes: string };
type T = { id: string; name: string };

const tone: Record<string, string> = {
  PENDING: "tertiary", CONFIRMED: "primary", SEATED: "secondary", CANCELLED: "error", NO_SHOW: "error",
};
const label: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmada", SEATED: "Sentada", CANCELLED: "Cancelada", NO_SHOW: "No llegó",
};

export default function ReservationsClient({ reservations, tables }: { reservations: R[]; tables: T[] }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ guestName: "", partySize: 2, dateTime: "", tableId: "", notes: "" });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: form.guestName, partySize: Number(form.partySize),
        dateTime: form.dateTime, tableId: form.tableId || null, notes: form.notes || null,
      }),
    });
    setForm({ guestName: "", partySize: 2, dateTime: "", tableId: "", notes: "" });
    setShow(false);
    setBusy(false);
    router.refresh();
  }

  async function setStatus(id: string, status: string) {
    await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle={`${reservations.length} reservas registradas`}
        icon="event_available"
        action={
          <button onClick={() => setShow((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary-container px-3 py-2 text-sm font-semibold text-white">
            <span className="material-symbols-outlined text-[18px]">add</span> Nueva reserva
          </button>
        }
      />

      {show && (
        <Card className="mx-5 mt-4 p-4 lg:mx-6">
          <form onSubmit={create} className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <input required placeholder="Nombre" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input type="number" min={1} placeholder="Personas" value={form.partySize} onChange={(e) => setForm({ ...form, partySize: +e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <input required type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" />
            <select value={form.tableId} onChange={(e) => setForm({ ...form, tableId: e.target.value })} className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface">
              <option value="">Sin mesa</option>
              {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button disabled={busy} className="rounded-lg bg-secondary-container py-2 text-sm font-semibold text-white">{busy ? "…" : "Guardar"}</button>
          </form>
        </Card>
      )}

      <div className="p-5 lg:p-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/40 text-left text-xs uppercase text-on-surface-variant">
                  <th className="px-4 py-3">Cliente</th><th>Fecha / Hora</th><th className="text-center">Pax</th><th>Mesa</th><th>Estado</th><th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant/20 hover:bg-surface-container/40">
                    <td className="px-4 py-3 font-medium text-on-surface">{r.guestName}</td>
                    <td className="text-on-surface-variant">{new Date(r.dateTime).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="text-center text-on-surface">{r.partySize}</td>
                    <td className="text-on-surface-variant">{r.tableName || "—"}</td>
                    <td><Badge tone={tone[r.status] ?? "surface"}>{label[r.status] ?? r.status}</Badge></td>
                    <td className="text-right">
                      <select
                        defaultValue=""
                        onChange={(e) => e.target.value && setStatus(r.id, e.target.value)}
                        className="rounded border border-outline-variant bg-surface-container px-2 py-1 text-xs text-on-surface"
                      >
                        <option value="">Cambiar…</option>
                        <option value="CONFIRMED">Confirmar</option>
                        <option value="SEATED">Sentar</option>
                        <option value="CANCELLED">Cancelar</option>
                        <option value="NO_SHOW">No llegó</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">Sin reservas.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
