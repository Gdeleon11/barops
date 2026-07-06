import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const STATUSES = ["FREE", "OCCUPIED", "RESERVED", "CLEANING"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const schema = z.object({
    name: z.string().min(1),
    seats: z.number().int().min(1).default(4),
    zone: z.string().min(1).default("Salón"),
    posX: z.number().optional(),
    posY: z.number().optional(),
  });
  const p = schema.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const table = await prisma.restaurantTable.create({ data: { ...p.data, branchId } });
  return NextResponse.json({ ok: true, table });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const existing = await prisma.restaurantTable.findFirst({ where: { id, branchId } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const data: any = {};
  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    data.status = body.status;
  }
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.seats === "number") data.seats = body.seats;
  if (typeof body.zone === "string" && body.zone.trim()) data.zone = body.zone.trim();
  if (typeof body.posX === "number") data.posX = Math.round(body.posX);
  if (typeof body.posY === "number") data.posY = Math.round(body.posY);

  const table = await prisma.restaurantTable.update({ where: { id }, data });
  return NextResponse.json({ ok: true, table });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const existing = await prisma.restaurantTable.findFirst({ where: { id, branchId } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  // free any orders link is not deleted; just remove the table
  await prisma.restaurantTable.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
