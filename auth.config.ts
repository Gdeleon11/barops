import type { NextAuthConfig } from "next-auth";

// Edge-safe config (NO Prisma / bcrypt here) — imported by middleware.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.branchId = (user as any).branchId;
        token.branchName = (user as any).branchName;
        token.tenantName = (user as any).tenantName;
      }
      if (trigger === "update" && (session as any)?.branchId) {
        token.branchId = (session as any).branchId;
        token.branchName = (session as any).branchName;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).branchId = token.branchId;
        (session.user as any).branchName = token.branchName;
        (session.user as any).tenantName = token.tenantName;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
