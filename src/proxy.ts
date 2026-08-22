import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";

/** Edge-safe proxy — JWT checks only, no Prisma. */
export const { auth: proxy } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  ...authConfig,
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
