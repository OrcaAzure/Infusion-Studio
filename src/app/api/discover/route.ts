import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public feed of shared recipes for Oven Infusion discover page */
export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get("cursor");
    const take = 20;

    const [featured, community] = await Promise.all([
      prisma.recipe.findMany({
        where: { isShared: true, isFeatured: true },
        orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
        take: 6,
        include: {
          user: { select: { socialHandle: true, name: true } },
          blend: {
            include: {
              ingredients: {
                include: { ingredient: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      }),
      prisma.recipe.findMany({
        where: { isShared: true },
        orderBy: { updatedAt: "desc" },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
          user: { select: { socialHandle: true, name: true } },
          blend: {
            include: {
              ingredients: {
                include: { ingredient: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      }),
    ]);

    const hasMore = community.length > take;
    const page = hasMore ? community.slice(0, take) : community;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    return NextResponse.json({ featured, community: page, nextCursor });
  } catch (err) {
    console.error("[API discover]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
