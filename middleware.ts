import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);
export default auth((request) => {
  if (!request.auth) return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(request.nextUrl.pathname)}`, request.url));
});
export const config = { matcher: ["/dashboard/:path*", "/customers/:path*", "/activity/:path*", "/reports/:path*", "/team-members/:path*", "/profile/:path*", "/settings/:path*", "/admin/:path*"] };