import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

/** Public feed of shared recipes for Oven Infusion discover page */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    const cursor = request.nextUrl.searchParams.get("cursor");
    const take = 20;

    const recipeInclude = {
      user: { select: { socialHandle: true, name: true } },
      _count: { select: { recipeLikes: true } },
      ...(user?.id
        ? { recipeLikes: { where: { userId: user.id }, select: { id: true }, take: 1 } }
        : {}),
      blend: {
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: "asc" as const },
          },
        },
      },
    };

    const [featuredRaw, communityRaw] = await Promise.all([
      prisma.recipe.findMany({
        where: { isShared: true, isFeatured: true },
        orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
        take: 6,
        include: recipeInclude,
      }),
      prisma.recipe.findMany({
        where: { isShared: true },
        orderBy: { updatedAt: "desc" },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: recipeInclude,
      }),
    ]);

    const mapRecipe = (r: (typeof featuredRaw)[0]) => {
      const { recipeLikes, ...rest } = r as typeof r & { recipeLikes?: { id: string }[] };
      return {
        ...rest,
        liked: (recipeLikes?.length ?? 0) > 0,
      };
    };

    const featured = featuredRaw.map(mapRecipe);
    const hasMore = communityRaw.length > take;
    const page = hasMore ? communityRaw.slice(0, take) : communityRaw;
    const community = page.map(mapRecipe);
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return NextResponse.json({ featured, community, nextCursor });
  } catch (err) {
    console.error("[API discover]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
