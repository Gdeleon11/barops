import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const bodySchema = z.object({
  tableId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  tip: z.number().min(0).default(0),
  status: z.enum(["OPEN", "SENT", "PAID"]).default("PAID"),
  items: z
    .array(z.object({ productId: z.string(), qty: z.number().int().min(1) }))
    .min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { tableId, customerId, tip, status, items } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, branchId },
  });
  const pMap = new Map(products.map((p: any) => [p.id, p]));

  let subtotal = 0;
  const lineItems = items.map((it) => {
    const p: any = pMap.get(it.productId);
    if (!p) throw new Error("Producto no encontrado");
    subtotal += p.price * it.qty;
    return { productId: p.id, name: p.name, price: p.price, qty: it.qty };
  });
  const tax = +(subtotal * 0.16).toFixed(2);
  const total = +(subtotal + tax + (tip || 0)).toFixed(2);

  const count = await prisma.order.count({ where: { branchId } });

  const order = await prisma.order.create({
    data: {
      branchId,
      tableId: tableId || null,
      customerId: customerId || null,
      waiterId: (session.user as any).id,
      number: count + 1,
      status,
      subtotal,
      tax,
      tip: tip || 0,
      total,
      items: { create: lineItems },
    },
    include: { items: true },
  });

  if (tableId) {
    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: { status: status === "PAID" ? "CLEANING" : "OCCUPIED" },
    });
  }
  if (customerId && status === "PAID") {
    await prisma.customer.update({
      where: { id: customerId },
      data: { visits: { increment: 1 }, totalSpent: { increment: total }, loyaltyPts: { increment: Math.floor(total / 10) } },
    });
  }

  return NextResponse.json({ ok: true, order });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const orders = await prisma.order.findMany({
    where: { branchId },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { table: true, items: true },
  });
  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { id, status } = await req.json();
  const ok = ["OPEN","SENT","PREPARING","READY","SERVED","PAID","CANCELLED"].includes(status);
  if (!id || !ok) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const existing = await prisma.order.findFirst({ where: { id, branchId } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const order = await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, order });
}
