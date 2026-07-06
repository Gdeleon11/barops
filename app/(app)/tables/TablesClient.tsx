"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/ui";

type T = { id: string; name: string; seats: number; zone: string; status: string };

const CYCLE: Record<string, string> = { FREE: "OCCUPIED", OCCUPIED: "RESERVED", RESERVED: "CLEANING", CLEANING: "FREE" };
const STYLES: Record<string, { bg: string; label: string; icon: string }> = {
  FREE: { bg: "border-secondary/50 bg-secondary-container/10 text-secondary", label: "Libre", icon: "check_circle" },
  OCCUPIED: { bg: "border-primary/50 bg-primary-container/15 text-primary", label: "Ocupada", icon: "restaurant" },
  RESERVED: { bg: "border-tertiary/50 bg-tertiary-container/15 text-tertiary", label: "Reservada", icon: "event" },
  CLEANING: { bg: "border-outline/50 bg-surface-container text-on-surface-variant", label: "Limpieza", icon: "cleaning_services" },
};

export default function TablesClient({ tables }: { tables: T[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const zones = Array.from(new Set(tables.map((t) => t.zone)));

  async function cycle(t: T) {
    setBusy(t.id);
    await fetch("/api/tables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, status: CYCLE[t.status] }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="Mesas y Salones" subtitle="Toca una mesa para cambiar su estado" icon="table_restaurant" />
      <div className="space-y-6 p-5 lg:p-6">
        {zones.map((z) => (
          <div key={z}>
            <h2 className="mb-3 font-display text-base font-semibold text-on-surface">{z}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {tables.filter((t) => t.zone === z).map((t) => {
                const s = STYLES[t.status];
                return (
                  <button
                    key={t.id}
                    disabled={busy === t.id}
                    onClick={() => cycle(t)}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 transition hover:scale-[1.02] ${s.bg}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                    <span className="mt-1 font-display text-lg font-bold">{t.name}</span>
                    <span className="text-xs opacity-80">{t.seats} pax · {s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {tables.length === 0 && <Card className="p-10 text-center text-on-surface-variant">Sin mesas configuradas.</Card>}
      </div>
    </div>
  );
}
