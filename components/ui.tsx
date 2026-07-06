import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 px-5 py-4 lg:px-6">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="material-symbols-outlined rounded-lg bg-surface-container p-2 text-primary">
            {icon}
          </span>
        )}
        <div>
          <h1 className="font-display text-xl font-bold text-on-surface">{title}</h1>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: "primary" | "secondary" | "tertiary" | "error";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    primary: "text-primary bg-primary-container/20",
    secondary: "text-secondary bg-secondary-container/20",
    tertiary: "text-tertiary bg-tertiary-container/20",
    error: "text-error bg-error-container/30",
  };
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">{label}</p>
        <span className={`material-symbols-outlined rounded-lg p-1.5 text-[20px] ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-on-surface">{value}</p>
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass-card rounded-xl ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "surface" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    surface: "bg-surface-container text-on-surface-variant",
    primary: "bg-primary-container/25 text-primary",
    secondary: "bg-secondary-container/25 text-secondary",
    tertiary: "bg-tertiary-container/25 text-tertiary",
    error: "bg-error-container/40 text-on-error-container",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone] ?? tones.surface}`}>
      {children}
    </span>
  );
}

export function money(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);
}

export function EmptyLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-primary hover:underline">
      {label}
    </Link>
  );
}

export const ORDER_STATUS_ES: Record<string, string> = {
  OPEN: "Abierta", SENT: "En cocina", PREPARING: "Preparando",
  READY: "Lista", SERVED: "Servida", PAID: "Pagada", CANCELLED: "Cancelada",
};
