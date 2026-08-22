import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";

const { auth } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  ...authConfig,
});

/** Next.js 16 requires a function named `proxy` (formerly middleware). */
export function proxy(request: NextRequest) {
  return auth(request);
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
