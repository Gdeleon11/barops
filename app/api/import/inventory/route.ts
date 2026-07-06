import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { currentBranchId } from "@/lib/session";
import { parseSheet, pick, num } from "@/lib/import";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const branchId = await currentBranchId();
  const replace = new URL(req.url).searchParams.get("replace") === "1";
  const rows = await parseSheet(req);
  if (rows.length === 0) return NextResponse.json({ error: "El archivo está vacío o no se pudo leer" }, { status: 400 });

  const data = rows.map((r) => ({
    branchId,
    name: String(pick(r, ["nombre", "name", "producto", "insumo", "item", "descripcion"]) ?? "").trim(),
    category: (pick(r, ["categoria", "category", "tipo", "familia"]) ?? null) as any,
    unit: String(pick(r, ["unidad", "unit", "medida", "um"]) ?? "unidad").trim() || "unidad",
    stock: num(pick(r, ["existencia", "stock", "cantidad", "qty", "cant"]), 0),
    parLevel: num(pick(r, ["minimo", "min", "parlevel", "reorden", "nivelminimo"]), 0),
    cost: num(pick(r, ["costo", "cost", "precio", "costounitario", "preciounitario"]), 0),
    supplier: (pick(r, ["proveedor", "supplier", "marca"]) ?? null) as any,
  })).filter((d) => d.name);

  if (data.length === 0) return NextResponse.json({ error: "No se encontró una columna de nombre/producto" }, { status: 400 });
  if (replace) await prisma.inventoryItem.deleteMany({ where: { branchId } });
  await prisma.inventoryItem.createMany({ data });
  return NextResponse.json({ ok: true, count: data.length });
}
