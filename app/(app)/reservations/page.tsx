import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import ReservationsClient from "./ReservationsClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const branchId = await currentBranchId();
  const [reservations, tables] = await Promise.all([
    prisma.reservation.findMany({ where: { branchId }, orderBy: { dateTime: "asc" }, include: { table: true } }),
    prisma.restaurantTable.findMany({ where: { branchId }, orderBy: { name: "asc" } }),
  ]);
  const plain = reservations.map((r: any) => ({
    id: r.id, guestName: r.guestName, partySize: r.partySize,
    dateTime: r.dateTime.toISOString(), status: r.status,
    tableName: r.table?.name ?? "", notes: r.notes ?? "",
  }));
  const tbls = tables.map((t: any) => ({ id: t.id, name: t.name }));
  return <ReservationsClient reservations={plain} tables={tbls} />;
}
