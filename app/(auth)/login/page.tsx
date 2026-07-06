"use client";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary-container py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 neon-glow-primary"
    >
      {pending ? "Ingresando…" : "Ingresar al panel"}
    </button>
  );
}

export default function LoginPage() {
  const [error, formAction] = useFormState(loginAction, undefined);
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% -10%, rgba(77,142,255,0.18), transparent), radial-gradient(900px 500px at 100% 100%, rgba(78,222,163,0.12), transparent)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container neon-glow-primary">
            <span className="material-symbols-outlined text-2xl text-white">nightlife</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">BarOps Pro</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Nocturne Operational Interface</p>
        </div>

        <form action={formAction} className="glass-card rounded-xl p-6 shadow-2xl">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Correo
          </label>
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@barops.pro"
            className="mb-4 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
            placeholder="tu@correo.com"
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Contraseña
          </label>
          <input
            name="password"
            type="password"
            required
            defaultValue="admin123"
            className="mb-4 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
            placeholder="••••••••"
          />
          {error && (
            <p className="mb-4 rounded-lg bg-error-container/40 px-3 py-2 text-sm text-on-error-container">
              {error}
            </p>
          )}
          <SubmitBtn />
        </form>

        <div className="mt-5 rounded-lg border border-outline-variant/60 bg-surface-container-low p-4 text-xs text-on-surface-variant">
          <p className="mb-1 font-semibold text-on-surface">Cuentas demo</p>
          <p>Owner: admin@barops.pro / admin123</p>
          <p>Gerente: gerente@barops.pro / gerente123</p>
          <p>Mesero: mesero@barops.pro / mesero123</p>
        </div>
      </div>
    </main>
  );
}
