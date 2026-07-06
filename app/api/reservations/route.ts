import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const schema = z.object({
  guestName: z.string().min(1),
  partySize: z.number().int().min(1),
  dateTime: z.string(),
  tableId: z.string().nullable().optional(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const p = schema.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const d = p.data;
  const reservation = await prisma.reservation.create({
    data: {
      branchId, guestName: d.guestName, partySize: d.partySize,
      dateTime: new Date(d.dateTime), tableId: d.tableId || null,
      notes: d.notes || null, status: "CONFIRMED",
    },
  });
  return NextResponse.json({ ok: true, reservation });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const { id, status } = await req.json();
  const ok = ["PENDING", "CONFIRMED", "SEATED", "CANCELLED", "NO_SHOW"].includes(status);
  if (!id || !ok) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const existing = await prisma.reservation.findFirst({ where: { id, branchId } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const reservation = await prisma.reservation.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, reservation });
}
