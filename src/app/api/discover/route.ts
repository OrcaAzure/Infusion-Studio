import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public feed of shared recipes for Oven Infusion discover page */
export async function GET() {
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

  return NextResponse.json({ featured, community });
}
