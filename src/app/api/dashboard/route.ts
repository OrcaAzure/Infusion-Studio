import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  try {
    const allIngredients = await prisma.ingredient.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        unit: true,
        lowStockThreshold: true,
      },
    });

    const lowStockItems = allIngredients
      .filter((i) => i.quantity <= (i.lowStockThreshold ?? 50))
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);

    const [
      totalIngredients,
      totalBlends,
      totalRecipes,
      favoriteCount,
      recentBlends,
      categoryGroups,
      inventoryItems,
    ] = await Promise.all([
      prisma.ingredient.count({ where: { userId } }),
      prisma.blend.count({ where: { userId } }),
      prisma.recipe.count({ where: { userId } }),
      prisma.favoriteBlend.count({ where: { userId } }),
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
  } catch (err) {
    console.error("[API dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
