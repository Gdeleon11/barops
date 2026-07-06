import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const tenant: any = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar brandName={tenant?.name ?? "BarOps"} logoUrl={tenant?.logoUrl ?? null} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
