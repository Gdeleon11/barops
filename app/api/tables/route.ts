import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { id, status } = await req.json();
  const ok = ["FREE", "OCCUPIED", "RESERVED", "CLEANING"].includes(status);
  if (!id || !ok) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const existing = await prisma.restaurantTable.findFirst({ where: { id, branchId } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const table = await prisma.restaurantTable.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, table });
}

const createSchema = z.object({ name: z.string().min(1), seats: z.number().int().min(1), zone: z.string().default("Salón") });
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const p = createSchema.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const table = await prisma.restaurantTable.create({ data: { ...p.data, branchId } });
  return NextResponse.json({ ok: true, table });
}
