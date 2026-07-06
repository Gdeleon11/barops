import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const createSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  unit: z.string().default("unidad"),
  stock: z.number().min(0).default(0),
  parLevel: z.number().min(0).default(0),
  cost: z.number().min(0).default(0),
  supplier: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const p = createSchema.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const item = await prisma.inventoryItem.create({ data: { ...p.data, branchId } });
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { id, delta, stock } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const existing = await prisma.inventoryItem.findFirst({ where: { id, branchId } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const newStock = typeof stock === "number" ? stock : Math.max(0, existing.stock + (delta || 0));
  const item = await prisma.inventoryItem.update({ where: { id }, data: { stock: newStock } });
  return NextResponse.json({ ok: true, item });
}
