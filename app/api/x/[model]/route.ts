import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

// Generic scoped CRUD for extended operational models.
type Scope = "branch" | "tenant" | "none";
const MODELS: Record<string, { delegate: string; scope: Scope }> = {
  waitlist: { delegate: "waitlistEntry", scope: "branch" },
  supplier: { delegate: "supplier", scope: "branch" },
  purchase: { delegate: "purchaseOrder", scope: "branch" },
  recipe: { delegate: "recipe", scope: "branch" },
  device: { delegate: "device", scope: "branch" },
  maintenance: { delegate: "maintenanceTask", scope: "branch" },
  alert: { delegate: "alert", scope: "branch" },
  campaign: { delegate: "campaign", scope: "branch" },
  pricerule: { delegate: "priceRule", scope: "branch" },
  audit: { delegate: "auditLog", scope: "branch" },
  invoice: { delegate: "invoice", scope: "tenant" },
  user: { delegate: "user", scope: "tenant" },
};

async function ctx() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as any;
}

export async function POST(req: Request, { params }: { params: { model: string } }) {
  const user = await ctx();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cfg = MODELS[params.model];
  if (!cfg) return NextResponse.json({ error: "Modelo inválido" }, { status: 400 });
  const branchId = await currentBranchId();

  const body = await req.json();
  const data: any = { ...body };
  for (const k of Object.keys(data)) { if (/Date$/.test(k) && typeof data[k] === "string" && data[k]) data[k] = new Date(data[k]); }

  if (cfg.scope === "branch") data.branchId = branchId;
  if (cfg.scope === "tenant") data.tenantId = user.tenantId;

  // Model-specific preparation
  if (params.model === "user") {
    const pwd = String(body.password || "cambiar123");
    delete data.password;
    data.passwordHash = await bcrypt.hash(pwd, 10);
    data.branchId = branchId;
  }
  if (params.model === "purchase" && Array.isArray(body.items)) {
    data.items = { create: body.items };
    data.total = body.items.reduce((s: number, i: any) => s + (i.cost || 0) * (i.qty || 1), 0);
  }
  if (params.model === "recipe" && Array.isArray(body.items)) {
    data.items = { create: body.items };
  }
  if (params.model === "purchase" && data.number == null) {
    data.number = (await (prisma as any).purchaseOrder.count({ where: { branchId } })) + 1001;
  }

  const created = await (prisma as any)[cfg.delegate].create({ data });
  return NextResponse.json({ ok: true, item: created });
}

export async function PATCH(req: Request, { params }: { params: { model: string } }) {
  const user = await ctx();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cfg = MODELS[params.model];
  if (!cfg) return NextResponse.json({ error: "Modelo inválido" }, { status: 400 });
  const branchId = await currentBranchId();

  const { id, ...rest } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const where: any = { id };
  if (cfg.scope === "branch") where.branchId = branchId;
  if (cfg.scope === "tenant") where.tenantId = user.tenantId;
  const existing = await (prisma as any)[cfg.delegate].findFirst({ where });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const data: any = { ...rest };
  if (params.model === "user" && rest.password) {
    delete data.password;
    data.passwordHash = await bcrypt.hash(String(rest.password), 10);
  }
  const updated = await (prisma as any)[cfg.delegate].update({ where: { id }, data });
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: Request, { params }: { params: { model: string } }) {
  const user = await ctx();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const cfg = MODELS[params.model];
  if (!cfg) return NextResponse.json({ error: "Modelo inválido" }, { status: 400 });
  const branchId = await currentBranchId();
  const { id } = await req.json();
  const where: any = { id };
  if (cfg.scope === "branch") where.branchId = branchId;
  if (cfg.scope === "tenant") where.tenantId = user.tenantId;
  const existing = await (prisma as any)[cfg.delegate].findFirst({ where });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  await (prisma as any)[cfg.delegate].delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
