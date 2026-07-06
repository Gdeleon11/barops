import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

// Wipes menu + inventory + recipes (keeps tables, users, customers).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { scope } = await req.json().catch(() => ({ scope: "menu" }));

  await prisma.orderItem.deleteMany({ where: { order: { branchId } } });
  await prisma.order.deleteMany({ where: { branchId } });
  await prisma.recipeItem.deleteMany({ where: { recipe: { branchId } } }).catch(() => {});
  await prisma.recipe.deleteMany({ where: { branchId } });
  await prisma.product.deleteMany({ where: { branchId } });
  await prisma.category.deleteMany({ where: { branchId } });
  if (scope === "all") {
    await prisma.inventoryItem.deleteMany({ where: { branchId } });
  }
  return NextResponse.json({ ok: true });
}
