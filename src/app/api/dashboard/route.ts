import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

const LOW_STOCK_THRESHOLD = 50;

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [
    totalIngredients,
    totalBlends,
    totalRecipes,
    favoriteCount,
    lowStockItems,
    recentBlends,
    categoryGroups,
    inventoryItems,
  ] = await Promise.all([
    prisma.ingredient.count({ where: { userId } }),
    prisma.blend.count({ where: { userId } }),
    prisma.recipe.count({ where: { userId } }),
    prisma.favoriteBlend.count({ where: { userId } }),
    prisma.ingredient.findMany({
      where: { userId, quantity: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { quantity: "asc" },
      take: 5,
    }),
    prisma.blend.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { recipes: true, favorites: true } },
      },
    }),
    prisma.ingredient.groupBy({
      by: ["category"],
      where: { userId },
      _count: { category: true },
    }),
    prisma.ingredient.findMany({
      where: { userId, pricePerUnit: { not: null } },
      select: { quantity: true, pricePerUnit: true },
    }),
  ]);

  const categoryBreakdown = categoryGroups.map((g) => ({
    category: g.category,
    count: g._count.category,
  }));

  const totalInventoryValue = inventoryItems.reduce(
    (sum, item) => sum + item.quantity * (item.pricePerUnit ?? 0),
    0
  );

  return NextResponse.json({
    totalIngredients,
    totalBlends,
    totalRecipes,
    favoriteCount,
    lowStockItems,
    recentBlends,
    categoryBreakdown,
    totalInventoryValue,
  });
}
