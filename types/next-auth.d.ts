import "next-auth";
declare module "next-auth" { interface User { role: import("@/lib/permissions").Role } interface Session { user: { id: string; role: import("@/lib/permissions").Role } & DefaultSession["user"] } }
declare module "next-auth/jwt" { interface JWT { role?: import("@/lib/permissions").Role } }