import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { tableId, orderId, tip } = await req.json();

  const where: any = { branchId, status: { notIn: ["PAID", "CANCELLED"] } };
  if (orderId) where.id = orderId;
  else if (tableId) where.tableId = tableId;
  else return NextResponse.json({ error: "Falta mesa u orden" }, { status: 400 });

  const orders = await prisma.order.findMany({ where });
  if (orders.length === 0) return NextResponse.json({ error: "Nada por cobrar" }, { status: 404 });

  let charged = 0;
  for (const o of orders as any[]) {
    await prisma.order.update({ where: { id: o.id }, data: { status: "PAID", tip: o.tip || (tip || 0) } });
    charged += o.total;
    if (o.customerId) {
      await prisma.customer.update({
        where: { id: o.customerId },
        data: { visits: { increment: 1 }, totalSpent: { increment: o.total }, loyaltyPts: { increment: Math.floor(o.total / 10) } },
      });
    }
  }
  if (tableId) await prisma.restaurantTable.update({ where: { id: tableId }, data: { status: "CLEANING" } });

  return NextResponse.json({ ok: true, charged, count: orders.length });
}
