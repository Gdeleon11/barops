import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const ITEM_STATUS = ["PENDING", "PREPARING", "READY", "SERVED"];

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { itemId, status } = await req.json();
  if (!itemId || !ITEM_STATUS.includes(status)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const item = await prisma.orderItem.findFirst({
    where: { id: itemId, order: { branchId } },
    include: { order: { include: { items: true } } },
  });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.orderItem.update({ where: { id: itemId }, data: { status } });

  // If all items in the order are served, mark the order SERVED (ready to charge)
  const others = (item as any).order.items.filter((i: any) => i.id !== itemId);
  const allServed = status === "SERVED" && others.every((i: any) => i.status === "SERVED");
  if (allServed && (item as any).order.status !== "PAID") {
    await prisma.order.update({ where: { id: (item as any).orderId }, data: { status: "SERVED" } });
  } else if ((item as any).order.status === "SENT" && status !== "PENDING") {
    await prisma.order.update({ where: { id: (item as any).orderId }, data: { status: "PREPARING" } });
  }
  return NextResponse.json({ ok: true });
}
