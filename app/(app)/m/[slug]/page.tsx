import { notFound } from "next/navigation";
import { ALL_ITEMS } from "@/lib/nav";
import { SCREENS } from "@/components/screens/registry";

export const dynamic = "force-dynamic";

export default function MockupPage({ params }: { params: { slug: string } }) {
  const item = ALL_ITEMS.find((i) => i.slug === params.slug && !i.native);
  if (!item) notFound();

  const Screen = SCREENS[item.slug];

  if (Screen) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-outline-variant/50 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{item.icon}</span>
            <h1 className="font-display text-lg font-semibold text-on-surface">{item.title}</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Screen />
        </div>
      </div>
    );
  }

  // Fallback: embed original mockup
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-outline-variant/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{item.icon}</span>
          <h1 className="font-display text-lg font-semibold text-on-surface">{item.title}</h1>
        </div>
      </div>
      <iframe src={`/mockups/${item.slug}.html`} title={item.title} className="h-full w-full flex-1 border-0 bg-surface" />
    </div>
  );
}
