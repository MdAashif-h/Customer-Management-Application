import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import authConfig from "@/auth.config";
import type { Role } from "@/lib/permissions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [Credentials({ credentials: { email: {}, password: {} }, async authorize(credentials) {
    const email = String(credentials?.email ?? "").toLowerCase().trim();
    const password = String(credentials?.password ?? "");
    if (process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "true" && email === process.env.DEV_AUTH_EMAIL?.toLowerCase() && password === process.env.DEV_AUTH_PASSWORD) {
      return { id: "local-demo-user", name: "Custora Demo", email, role: "ADMIN" as Role };
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.passwordHash))) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
  } })],
});