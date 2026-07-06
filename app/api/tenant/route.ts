import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { plan } = await req.json();
  if (!["FREE", "PRO", "ENTERPRISE"].includes(plan)) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  const tenant = await prisma.tenant.update({ where: { id: (session.user as any).tenantId }, data: { plan } });
  return NextResponse.json({ ok: true, tenant });
}
