import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function currentUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Returns the active branch id for the logged-in user (falls back to first branch of tenant). */
export async function currentBranchId(): Promise<string> {
  const user = await currentUser();
  if (user.branchId) return user.branchId;
  const branch = await prisma.branch.findFirst({ where: { tenantId: user.tenantId } });
  if (!branch) redirect("/login");
  return branch.id;
}
