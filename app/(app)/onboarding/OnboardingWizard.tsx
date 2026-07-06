"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Initial = { name: string; businessType: string; phone: string; about: string; logoUrl: string; branchName: string; address: string };
type Counts = { products: number; inventory: number; recipes: number };

const TYPES = [
  { v: "BAR", l: "Bar", i: "local_bar" },
  { v: "RESTAURANTE", l: "Restaurante", i: "restaurant" },
  { v: "AMBOS", l: "Bar-Restaurante", i: "dining" },
  { v: "CAFE", l: "Café", i: "coffee" },
  { v: "ANTRO", l: "Antro / Club", i: "nightlife" },
];

function Step({ n, cur, label }: { n: number; cur: number; label: string }) {
  const done = cur > n, active = cur === n;
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-secondary-container text-white" : active ? "bg-primary-container text-white" : "bg-surface-container text-on-surface-variant"}`}>
        {done ? "✓" : n}
      </div>
      <span className={`text-sm ${active ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>{label}</span>
    </div>
  );
}

export default function OnboardingWizard({ initial, counts }: { initial: Initial; counts: Counts }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [biz, setBiz] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 500000) { setMsg("El logo debe pesar menos de 500 KB."); return; }
    const r = new FileReader();
    r.onload = () => setBiz({ ...biz, logoUrl: String(r.result) });
    r.readAsDataURL(f);
  }

  async function saveBiz() {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(biz) });
    setBusy(false);
    if (res.ok) { setMsg("Datos guardados ✓"); router.refresh(); setStep(2); }
    else setMsg("Error al guardar");
  }

  async function upload(kind: "products" | "inventory", form: HTMLFormElement, replace: boolean) {
    const input = form.querySelector('input[type=file]') as HTMLInputElement;
    if (!input?.files?.[0]) { setMsg("Selecciona un archivo Excel/CSV primero."); return; }
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append("file", input.files[0]);
    const res = await fetch(`/api/import/${kind}?replace=${replace ? 1 : 0}`, { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    if (res.ok) { setMsg(`Importados ${data.count} registros ✓`); router.refresh(); }
    else setMsg(data.error || "Error al importar");
  }

  async function generateRecipes() {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/recipes/generate", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    setMsg(res.ok ? `Se generaron ${data.created} recetas estimadas ✓` : "Error");
    router.refresh();
  }

  async function reset(scope: "menu" | "all") {
    if (!confirm(scope === "all" ? "Esto borra menú, inventario y recetas. ¿Continuar?" : "Esto borra menú y recetas. ¿Continuar?")) return;
    setBusy(true);
    await fetch("/api/setup/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope }) });
    setBusy(false); setMsg("Datos borrados ✓"); router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-on-surface">Configuración inicial</h1>
        <p className="text-sm text-on-surface-variant">Configura tu negocio, carga tu menú e inventario, y genera recetas.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4">
        {["Negocio", "Menú", "Inventario", "Recetas", "Listo"].map((l, i) => <Step key={l} n={i + 1} cur={step} label={l} />)}
      </div>

      {msg && <div className="mb-4 rounded-lg bg-primary-container/20 px-4 py-2 text-sm text-primary">{msg}</div>}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-on-surface">1. Datos del negocio</h2>
          <label className="mb-1 block text-xs uppercase text-on-surface-variant">Tipo de negocio</label>
          <div className="mb-4 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t.v} onClick={() => setBiz({ ...biz, businessType: t.v })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${biz.businessType === t.v ? "border-primary bg-primary-container/20 text-primary" : "border-outline-variant bg-surface-container text-on-surface-variant"}`}>
                <span className="material-symbols-outlined text-[18px]">{t.i}</span>{t.l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="mb-1 block text-xs uppercase text-on-surface-variant">Nombre del negocio</label>
              <input value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" /></div>
            <div><label className="mb-1 block text-xs uppercase text-on-surface-variant">Sucursal</label>
              <input value={biz.branchName} onChange={(e) => setBiz({ ...biz, branchName: e.target.value })} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-xs uppercase text-on-surface-variant">Dirección</label>
              <input value={biz.address} onChange={(e) => setBiz({ ...biz, address: e.target.value })} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" /></div>
            <div><label className="mb-1 block text-xs uppercase text-on-surface-variant">Teléfono</label>
              <input value={biz.phone} onChange={(e) => setBiz({ ...biz, phone: e.target.value })} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" /></div>
            <div><label className="mb-1 block text-xs uppercase text-on-surface-variant">Logo</label>
              <div className="flex items-center gap-3">
                {biz.logoUrl && <img src={biz.logoUrl} alt="logo" className="h-10 w-10 rounded-lg object-cover" />}
                <input type="file" accept="image/*" onChange={onLogo} className="text-xs text-on-surface-variant" />
              </div></div>
            <div className="md:col-span-2"><label className="mb-1 block text-xs uppercase text-on-surface-variant">Información general</label>
              <textarea value={biz.about} onChange={(e) => setBiz({ ...biz, about: e.target.value })} rows={3} placeholder="Concepto, horarios, notas…" className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface" /></div>
          </div>
          <div className="mt-5 flex justify-end">
            <button disabled={busy} onClick={saveBiz} className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Guardando…" : "Guardar y continuar"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 - Menu */}
      {step === 2 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-1 font-display text-lg font-semibold text-on-surface">2. Cargar menú (Excel/CSV)</h2>
          <p className="mb-4 text-sm text-on-surface-variant">Columnas esperadas: <b>Nombre</b>, <b>Categoría</b>, <b>Precio</b>, y opcional <b>Costo</b>. Actualmente tienes <b>{counts.products}</b> productos.</p>
          <form onSubmit={(e) => { e.preventDefault(); }} className="rounded-lg border border-dashed border-outline-variant/60 p-4">
            <input type="file" accept=".xlsx,.xls,.csv" className="mb-3 block text-sm text-on-surface-variant" />
            <label className="mb-3 flex items-center gap-2 text-sm text-on-surface-variant">
              <input type="checkbox" id="repP" /> Reemplazar el menú actual (empezar de cero)
            </label>
            <button type="button" disabled={busy}
              onClick={(e) => upload("products", (e.currentTarget.closest("form") as HTMLFormElement), (document.getElementById("repP") as HTMLInputElement)?.checked)}
              className="rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Importando…" : "Importar menú"}
            </button>
          </form>
          <div className="mt-3 text-sm text-on-surface-variant">¿Prefieres a mano? Agrégalos en <Link href="/pos" className="text-primary hover:underline">POS</Link> o crea productos directamente.</div>
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(1)} className="text-sm text-on-surface-variant hover:text-on-surface">← Atrás</button>
            <button onClick={() => setStep(3)} className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white">Siguiente</button>
          </div>
        </div>
      )}

      {/* STEP 3 - Inventory */}
      {step === 3 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-1 font-display text-lg font-semibold text-on-surface">3. Cargar inventario (Excel/CSV)</h2>
          <p className="mb-4 text-sm text-on-surface-variant">Columnas: <b>Nombre</b>, <b>Categoría</b>, <b>Unidad</b>, <b>Existencia</b>, <b>Mínimo</b>, <b>Costo</b>, <b>Proveedor</b>. Tienes <b>{counts.inventory}</b> insumos.</p>
          <form onSubmit={(e) => e.preventDefault()} className="rounded-lg border border-dashed border-outline-variant/60 p-4">
            <input type="file" accept=".xlsx,.xls,.csv" className="mb-3 block text-sm text-on-surface-variant" />
            <label className="mb-3 flex items-center gap-2 text-sm text-on-surface-variant">
              <input type="checkbox" id="repI" /> Reemplazar el inventario actual
            </label>
            <button type="button" disabled={busy}
              onClick={(e) => upload("inventory", (e.currentTarget.closest("form") as HTMLFormElement), (document.getElementById("repI") as HTMLInputElement)?.checked)}
              className="rounded-lg bg-secondary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Importando…" : "Importar inventario"}
            </button>
          </form>
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(2)} className="text-sm text-on-surface-variant hover:text-on-surface">← Atrás</button>
            <button onClick={() => setStep(4)} className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white">Siguiente</button>
          </div>
        </div>
      )}

      {/* STEP 4 - Recipes */}
      {step === 4 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="mb-1 font-display text-lg font-semibold text-on-surface">4. Generar recetas / escandallos</h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Crea recetas <b>estimadas</b> a partir de tus {counts.products} productos (ingredientes y costo aproximados por categoría). Luego las editas en <Link href="/m/recetas_y_escandallos" className="text-primary hover:underline">Recetas y Escandallos</Link> para dejarlas exactas. Tienes <b>{counts.recipes}</b> recetas.
          </p>
          <button disabled={busy} onClick={generateRecipes} className="rounded-lg bg-tertiary-container px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Generando…" : "Generar recetas estimadas"}
          </button>
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(3)} className="text-sm text-on-surface-variant hover:text-on-surface">← Atrás</button>
            <button onClick={() => setStep(5)} className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white">Finalizar</button>
          </div>
        </div>
      )}

      {/* STEP 5 - Done */}
      {step === 5 && (
        <div className="glass-card rounded-xl p-6 text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-secondary">check_circle</span>
          <h2 className="mb-2 font-display text-lg font-semibold text-on-surface">¡Listo!</h2>
          <p className="mb-4 text-sm text-on-surface-variant">Revisa que la información quedó correcta:</p>
          <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
            <Link href="/m/dashboard_de_ventas_por_producto" className="rounded-lg bg-surface-container p-3 hover:bg-surface-container-high"><p className="font-display text-xl font-bold text-on-surface">{counts.products}</p><p className="text-xs text-on-surface-variant">Productos</p></Link>
            <Link href="/inventory" className="rounded-lg bg-surface-container p-3 hover:bg-surface-container-high"><p className="font-display text-xl font-bold text-on-surface">{counts.inventory}</p><p className="text-xs text-on-surface-variant">Inventario</p></Link>
            <Link href="/m/recetas_y_escandallos" className="rounded-lg bg-surface-container p-3 hover:bg-surface-container-high"><p className="font-display text-xl font-bold text-on-surface">{counts.recipes}</p><p className="text-xs text-on-surface-variant">Recetas</p></Link>
          </div>
          <div className="mt-6 border-t border-outline-variant/30 pt-4">
            <p className="mb-2 text-xs uppercase text-on-surface-variant">Zona de riesgo</p>
            <div className="flex justify-center gap-2">
              <button onClick={() => reset("menu")} className="rounded-lg bg-error-container/30 px-3 py-1.5 text-xs text-error">Borrar menú y recetas</button>
              <button onClick={() => reset("all")} className="rounded-lg bg-error-container/30 px-3 py-1.5 text-xs text-error">Borrar todo (empezar de 0)</button>
            </div>
          </div>
          <div className="mt-5"><Link href="/dashboard" className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-white">Ir al Dashboard</Link></div>
        </div>
      )}
    </div>
  );
}
