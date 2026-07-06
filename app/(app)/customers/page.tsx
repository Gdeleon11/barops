import { prisma } from "@/lib/prisma";
import { currentBranchId } from "@/lib/session";
import CustomersClient from "./CustomersClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const branchId = await currentBranchId();
  const customers = await prisma.customer.findMany({ where: { branchId }, orderBy: { totalSpent: "desc" } });
  const plain = customers.map((c: any) => ({
    id: c.id, name: c.name, phone: c.phone ?? "", email: c.email ?? "",
    notes: c.notes ?? "", loyaltyPts: c.loyaltyPts, visits: c.visits, totalSpent: c.totalSpent, vip: c.vip,
  }));
  return <CustomersClient customers={plain} />;
}
