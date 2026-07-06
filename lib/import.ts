import * as XLSX from "xlsx";

export async function parseSheet(req: Request): Promise<Record<string, any>[]> {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof (file as any).arrayBuffer !== "function") return [];
  const buf = Buffer.from(await (file as File).arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

function norm(s: string) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

export function pick(row: Record<string, any>, keys: string[]): any {
  const map: Record<string, any> = {};
  for (const k of Object.keys(row)) map[norm(k)] = row[k];
  for (const k of keys) { const v = map[norm(k)]; if (v !== undefined && v !== "") return v; }
  return undefined;
}

export function num(v: any, def = 0): number {
  if (v === undefined || v === null || v === "") return def;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? def : n;
}
