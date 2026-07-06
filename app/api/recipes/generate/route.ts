import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";

const DRINK = ["cóctel", "coctel", "cerveza", "vino", "destilado", "bebida", "trago", "licor", "shot"];

function foodCostFactor(cat: string): number {
  const c = (cat || "").toLowerCase();
  if (DRINK.some((d) => c.includes(d))) return 0.22;
  if (c.includes("postre")) return 0.28;
  if (c.includes("cocina") || c.includes("comida") || c.includes("plato")) return 0.32;
  return 0.3;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();

  const products = await prisma.product.findMany({ where: { branchId }, include: { category: true } });
  const existing = await prisma.recipe.findMany({ where: { branchId } });
  const have = new Set((existing as any[]).map((r) => r.name.toLowerCase()));

  let created = 0;
  for (const p of products as any[]) {
    if (have.has(p.name.toLowerCase())) continue;
    const catName = p.category?.name ?? "General";
    const est = p.cost && p.cost > 0 ? p.cost : +(p.price * foodCostFactor(catName)).toFixed(2);
    const isDrink = DRINK.some((d) => catName.toLowerCase().includes(d));
    const items = isDrink
      ? [
          { ingredient: "Licor / base", qty: 45, unit: "ml", cost: +(est * 0.6).toFixed(2) },
          { ingredient: "Mixers / jugos", qty: 60, unit: "ml", cost: +(est * 0.3).toFixed(2) },
          { ingredient: "Guarnición / hielo", qty: 1, unit: "porción", cost: +(est * 0.1).toFixed(2) },
        ]
      : [
          { ingredient: "Insumo principal", qty: 1, unit: "porción", cost: +(est * 0.6).toFixed(2) },
          { ingredient: "Guarniciones", qty: 1, unit: "porción", cost: +(est * 0.25).toFixed(2) },
          { ingredient: "Salsa / condimentos", qty: 1, unit: "porción", cost: +(est * 0.15).toFixed(2) },
        ];
    await prisma.recipe.create({
      data: {
        branchId, name: p.name, category: catName, yield: "1 porción",
        salePrice: p.price, items: { create: items },
      },
    });
    created++;
  }
  return NextResponse.json({ ok: true, created });
}
