import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { openingCash, notes } = await req.json();
  const open = await prisma.shift.findFirst({ where: { branchId, closedAt: null } });
  if (open) return NextResponse.json({ error: "Ya hay un turno abierto" }, { status: 400 });
  const shift = await prisma.shift.create({
    data: { branchId, userId: (session.user as any).id, openingCash: Number(openingCash) || 0, notes: notes || null },
  });
  return NextResponse.json({ ok: true, shift });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { id, closingCash, notes } = await req.json();
  const shift = id
    ? await prisma.shift.findFirst({ where: { id, branchId } })
    : await prisma.shift.findFirst({ where: { branchId, closedAt: null } });
  if (!shift) return NextResponse.json({ error: "No hay turno abierto" }, { status: 404 });

  const start = shift.openedAt;
  const paid = await prisma.order.findMany({ where: { branchId, status: "PAID", createdAt: { gte: start } }, select: { total: true } });
  const salesTotal = paid.reduce((s: number, o: any) => s + o.total, 0);

  const updated = await prisma.shift.update({
    where: { id: shift.id },
    data: { closedAt: new Date(), closingCash: Number(closingCash) || 0, salesTotal, notes: notes ?? shift.notes },
  });
  return NextResponse.json({ ok: true, shift: updated });
}
