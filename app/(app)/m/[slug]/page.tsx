import { notFound } from "next/navigation";
import { ALL_ITEMS } from "@/lib/nav";

export function generateStaticParams() {
  return ALL_ITEMS.filter((i) => !i.native).map((i) => ({ slug: i.slug }));
}

export default function MockupPage({ params }: { params: { slug: string } }) {
  const item = ALL_ITEMS.find((i) => i.slug === params.slug && !i.native);
  if (!item) notFound();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{item.icon}</span>
          <h1 className="font-display text-lg font-semibold text-on-surface">{item.title}</h1>
        </div>
        <a
          href={`/mockups/${item.slug}.html`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          Pantalla completa
        </a>
      </div>
      <iframe
        src={`/mockups/${item.slug}.html`}
        title={item.title}
        className="h-full w-full flex-1 border-0 bg-surface"
      />
    </div>
  );
}
