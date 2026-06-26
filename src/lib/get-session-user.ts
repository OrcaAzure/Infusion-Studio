import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TRIAL_EMAIL = "trial@trial.com";

/** Returns the current user, or the trial user when SKIP_AUTH=true (local preview). */
export async function getSessionUser() {
  if (process.env.SKIP_AUTH === "true") {
    return prisma.user.findUnique({
      where: { email: TRIAL_EMAIL },
      select: { id: true, email: true, name: true, image: true },
    });
  }

  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
}

export function isDevBypass() {
  return process.env.SKIP_AUTH === "true";
}
