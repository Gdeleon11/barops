import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const b = await req.json();

  await prisma.tenant.update({
    where: { id: (session.user as any).tenantId },
    data: {
      name: b.name?.trim() || undefined,
      businessType: b.businessType || null,
      phone: b.phone || null,
      about: b.about || null,
      logoUrl: typeof b.logoUrl === "string" && b.logoUrl.length < 700000 ? b.logoUrl : undefined,
      onboarded: true,
    },
  });
  if (b.address || b.branchName) {
    await prisma.branch.update({
      where: { id: branchId },
      data: { address: b.address || undefined, name: b.branchName?.trim() || undefined },
    });
  }
  return NextResponse.json({ ok: true });
}
