"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";

export default function Sidebar({ brandName = "BarOps", logoUrl = null }: { brandName?: string; logoUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-3 top-3 z-40 rounded-lg bg-surface-container p-2 text-on-surface lg:hidden"
        aria-label="Menú"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed z-40 flex h-screen w-64 flex-col border-r border-outline-variant/50 bg-surface-container-lowest transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-4">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-container">
              <span className="material-symbols-outlined text-white">nightlife</span>
            </div>
          )}
          <div>
            <p className="font-display text-lg font-bold leading-none text-on-surface">{brandName}</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Pro · Nocturne</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {NAV.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-outline">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition ${
                          active
                            ? "bg-primary-container/20 text-primary font-medium"
                            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
