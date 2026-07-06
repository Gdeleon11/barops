import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
  vip: z.boolean().default(false),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const p = schema.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const d = p.data;
  const customer = await prisma.customer.create({
    data: { branchId, name: d.name, phone: d.phone || null, email: d.email || null, notes: d.notes || null, vip: d.vip },
  });
  return NextResponse.json({ ok: true, customer });
}
