import type { NextAuthConfig } from "next-auth";

/** Edge-safe config for the Next.js proxy. Keep Prisma/bcrypt out of this file. */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (process.env.SKIP_AUTH === "true") return true;

      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isPublicPage = nextUrl.pathname === "/";

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (isPublicPage) return true;

      if (!isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
