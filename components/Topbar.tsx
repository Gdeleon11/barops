import { signOut } from "@/auth";

export default function Topbar({
  user,
}: {
  user: { name?: string | null; role?: string; branchName?: string; tenantName?: string };
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant/50 bg-surface/80 px-4 backdrop-blur lg:px-6">
      <div className="pl-10 lg:pl-0">
        <p className="text-sm font-semibold text-on-surface">{user.tenantName ?? "BarOps"}</p>
        <p className="text-xs text-on-surface-variant">
          {user.branchName ?? "Sucursal"} · <span className="capitalize">{user.role?.toLowerCase()}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg bg-surface-container px-3 py-1.5 sm:flex">
          <span className="material-symbols-outlined text-[18px] text-secondary">circle</span>
          <span className="text-xs text-on-surface-variant">En línea</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-white">
            {(user.name ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none text-on-surface">{user.name}</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            className="rounded-lg bg-surface-container p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-error"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </form>
      </div>
    </header>
  );
}
