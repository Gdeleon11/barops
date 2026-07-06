import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const branchId = await currentBranchId();
  const items = await prisma.inventoryItem.findMany({ where: { branchId }, orderBy: { name: "asc" } });
  const plain = items.map((i: any) => ({
    id: i.id, name: i.name, unit: i.unit, stock: i.stock, parLevel: i.parLevel, cost: i.cost, supplier: i.supplier ?? "",
  }));
  return <InventoryClient items={plain} />;
}
