import { prisma } from "@/lib/prisma";
import { currentBranchId, currentUser } from "@/lib/session";
import OnboardingWizard from "./OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await currentUser();
  const branchId = await currentBranchId();
  const [tenant, branch, counts] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: user.tenantId } }),
    prisma.restaurantTable.findFirst({ where: { branchId } }).then(() => prisma.branch.findUnique({ where: { id: branchId } })),
    Promise.all([
      prisma.product.count({ where: { branchId } }),
      prisma.inventoryItem.count({ where: { branchId } }),
      (prisma as any).recipe.count({ where: { branchId } }),
    ]),
  ]);
  const t: any = tenant; const b: any = branch;
  return (
    <OnboardingWizard
      initial={{
        name: t?.name ?? "", businessType: t?.businessType ?? "", phone: t?.phone ?? "",
        about: t?.about ?? "", logoUrl: t?.logoUrl ?? "",
        branchName: b?.name ?? "", address: b?.address ?? "",
      }}
      counts={{ products: counts[0], inventory: counts[1], recipes: counts[2] }}
    />
  );
}
