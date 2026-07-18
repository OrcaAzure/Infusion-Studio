import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

/** Full user data backup as JSON (ingredients, blends, recipes, logs). */
export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [ingredients, blends, recipes, brewLogs, favorites] = await Promise.all([
    prisma.ingredient.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.blend.findMany({
      where: { userId },
      include: {
        ingredients: { orderBy: { order: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.recipe.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    prisma.brewLog.findMany({ where: { userId }, orderBy: { brewedAt: "desc" }, take: 500 }),
    prisma.favoriteBlend.findMany({ where: { userId } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    user: { id: user.id, email: user.email, name: user.name },
    ingredients,
    blends,
    recipes,
    brewLogs,
    favorites,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="infusion-studio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
