import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.password) return null;

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        } catch (error) {
          console.error("[auth] login failed", error);
          return null;
        }
      },
    }),
  ],
});
