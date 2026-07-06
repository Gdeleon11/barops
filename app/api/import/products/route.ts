import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";
import { parseSheet, pick, num } from "@/lib/import";

const COLORS = ["#adc6ff", "#4edea3", "#ffb95f", "#ff8fa3", "#c58bff", "#4d8eff", "#6ffbbe"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const replace = new URL(req.url).searchParams.get("replace") === "1";
  const rows = await parseSheet(req);
  if (rows.length === 0) return NextResponse.json({ error: "El archivo está vacío o no se pudo leer" }, { status: 400 });

  const parsed = rows.map((r) => ({
    name: String(pick(r, ["nombre", "name", "producto", "platillo", "bebida", "descripcion"]) ?? "").trim(),
    category: String(pick(r, ["categoria", "category", "tipo", "familia", "seccion"]) ?? "General").trim() || "General",
    price: num(pick(r, ["precio", "price", "preciodeventa", "venta", "pvp"]), 0),
    cost: num(pick(r, ["costo", "cost", "costounitario"]), 0),
  })).filter((p) => p.name);
  if (parsed.length === 0) return NextResponse.json({ error: "No se encontró columna de nombre/producto" }, { status: 400 });

  if (replace) {
    await prisma.orderItem.deleteMany({ where: { order: { branchId } } });
    await prisma.product.deleteMany({ where: { branchId } });
    await prisma.category.deleteMany({ where: { branchId } });
  }

  const catNames = Array.from(new Set(parsed.map((p) => p.category)));
  const existing = await prisma.category.findMany({ where: { branchId } });
  const catMap = new Map((existing as any[]).map((c) => [c.name.toLowerCase(), c.id]));
  let ci = existing.length;
  for (const name of catNames) {
    if (!catMap.has(name.toLowerCase())) {
      const c = await prisma.category.create({ data: { branchId, name, color: COLORS[ci % COLORS.length] } });
      catMap.set(name.toLowerCase(), (c as any).id);
      ci++;
    }
  }

  await prisma.product.createMany({
    data: parsed.map((p) => ({
      branchId, name: p.name,
      categoryId: catMap.get(p.category.toLowerCase()) ?? null,
      price: p.price, cost: p.cost || +(p.price * 0.3).toFixed(2),
    })),
  });
  return NextResponse.json({ ok: true, count: parsed.length, categories: catNames.length });
}
