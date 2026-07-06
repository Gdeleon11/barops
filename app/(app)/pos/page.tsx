import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import POSClient from "./POSClient";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const branchId = await currentBranchId();
  const [products, categories, tables] = await Promise.all([
    prisma.product.findMany({ where: { branchId, active: true }, include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { branchId }, orderBy: { name: "asc" } }),
    prisma.restaurantTable.findMany({ where: { branchId }, orderBy: { name: "asc" } }),
  ]);

  const plain = products.map((p: any) => ({
    id: p.id, name: p.name, price: p.price,
    categoryId: p.categoryId as string | null,
    categoryName: p.category?.name ?? "General",
    color: p.category?.color ?? "#4d8eff",
  }));
  const cats = categories.map((c: any) => ({ id: c.id, name: c.name, color: c.color }));
  const tbls = tables.map((t: any) => ({ id: t.id, name: t.name, status: t.status }));

  return <POSClient products={plain} categories={cats} tables={tbls} />;
}
