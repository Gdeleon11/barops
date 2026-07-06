import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      tenantId: string;
      branchId?: string;
      branchName?: string;
      tenantName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    tenantId?: string;
    branchId?: string;
    branchName?: string;
    tenantName?: string;
  }
}
