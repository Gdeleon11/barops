"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/components/ui";

type T = { id: string; name: string; seats: number; zone: string; status: string };
const CYCLE: Record<string, string> = { FREE: "OCCUPIED", OCCUPIED: "RESERVED", RESERVED: "CLEANING", CLEANING: "FREE" };
const S: Record<string, { ring: string; text: string; label: string; icon: string }> = {
  FREE: { ring: "border-secondary/60 bg-secondary-container/10", text: "text-secondary", label: "Libre", icon: "check_circle" },
  OCCUPIED: { ring: "border-primary/70 bg-primary-container/20", text: "text-primary", label: "Ocupada", icon: "restaurant" },
  RESERVED: { ring: "border-tertiary/70 bg-tertiary-container/15", text: "text-tertiary", label: "Reservada", icon: "event" },
  CLEANING: { ring: "border-outline/50 bg-surface-container", text: "text-on-surface-variant", label: "Limpieza", icon: "cleaning_services" },
};

function shape(seats: number, isBar: boolean) {
  if (isBar) return "w-20 h-16 rounded-full";
  if (seats <= 2) return "w-24 h-24 rounded-full";
  if (seats <= 4) return "w-28 h-28 rounded-2xl";
  if (seats <= 6) return "w-40 h-28 rounded-2xl";
  return "w-56 h-28 rounded-2xl";
}

export default function PlanoClient({
  tables, totals, serviceTotal,
}: { tables: T[]; totals: Record<string, { total: number; n: number }>; serviceTotal: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const zones = Array.from(new Set(tables.map((t) => t.zone)));
  const occ = tables.filter((t) => t.status === "OCCUPIED").length;

  async function cycle(t: T) {
    setBusy(t.id);
    await fetch("/api/tables", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, status: CYCLE[t.status] }) });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-primary-container/25 px-3 py-1 text-primary">{occ} ocupadas</span>
          <span className="rounded-full bg-secondary-container/25 px-3 py-1 text-secondary">{tables.length - occ} disponibles</span>
          <span className="rounded-full bg-tertiary-container/25 px-3 py-1 text-tertiary">{money(serviceTotal)} en servicio</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Libre</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Ocupada</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-tertiary" /> Reservada</span>
          <button onClick={() => router.refresh()} className="ml-2 flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 hover:text-on-surface"><span className="material-symbols-outlined text-[16px]">refresh</span>Actualizar</button>
        </div>
      </div>

      <div className="space-y-5">
        {zones.map((z) => {
          const isBar = /barra|bar/i.test(z);
          return (
            <div key={z} className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">{isBar ? "local_bar" : "deck"}</span>
                <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-on-surface">{z}</h3>
              </div>
              <div className="flex flex-wrap items-end gap-5">
                {tables.filter((t) => t.zone === z).map((t) => {
                  const st = S[t.status]; const info = totals[t.id];
                  return (
                    <button
                      key={t.id}
                      disabled={busy === t.id}
                      onClick={() => cycle(t)}
                      title={`${t.name} · ${st.label} — clic para cambiar`}
                      className={`group relative flex ${shape(t.seats, isBar)} flex-col items-center justify-center border-2 ${st.ring} transition hover:scale-[1.04] hover:shadow-lg`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${st.text}`}>{st.icon}</span>
                      <span className="font-display text-base font-bold text-on-surface">{t.name}</span>
                      {!isBar && <span className="text-[10px] text-on-surface-variant">{t.seats} pax</span>}
                      {info && <span className="mt-0.5 rounded-full bg-primary-container/30 px-1.5 text-[10px] font-medium text-primary">{money(info.total)}</span>}
                    </button>
                  );
                })}
                {tables.filter((t) => t.zone === z).length === 0 && <span className="text-sm text-on-surface-variant">Sin mesas en esta área.</span>}
              </div>
            </div>
          );
        })}
        {tables.length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline-variant/50 p-10 text-center text-on-surface-variant">
            No hay mesas. Agrégalas en "Mesas y Salones".
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-on-surface-variant">Toca una mesa para cambiar su estado. Para <b>agregar, editar o eliminar</b> mesas y áreas, ve a "Mesas y Salones".</p>
    </div>
  );
}
