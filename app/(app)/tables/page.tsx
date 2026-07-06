import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import TablesClient from "./TablesClient";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const branchId = await currentBranchId();
  const tables = await prisma.restaurantTable.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  const plain = tables.map((t: any) => ({ id: t.id, name: t.name, seats: t.seats, zone: t.zone, status: t.status }));
  return <TablesClient tables={plain} />;
}
