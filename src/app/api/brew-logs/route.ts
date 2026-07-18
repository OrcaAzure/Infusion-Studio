import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { brewLogSchema } from "@/lib/validations/brew-log";
import { calcStreak } from "@/lib/brew-streak";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipeId = request.nextUrl.searchParams.get("recipeId");
  const blendId = request.nextUrl.searchParams.get("blendId");
  const cursor = request.nextUrl.searchParams.get("cursor");

  try {
    const where = {
      userId: user.id,
      ...(recipeId ? { recipeId } : {}),
      ...(blendId ? { blendId } : {}),
    };

    const logs = await prisma.brewLog.findMany({
      where,
      orderBy: { brewedAt: "desc" },
      take: recipeId || blendId ? 50 : 51,
      ...(cursor && !recipeId && !blendId
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      include: {
        blend: { select: { id: true, name: true } },
        recipe: { select: { id: true, name: true } },
      },
    });

    if (recipeId || blendId) {
      return NextResponse.json(logs);
    }

    const hasMore = logs.length > 50;
    const page = hasMore ? logs.slice(0, 50) : logs;
    return NextResponse.json({
      logs: page,
      nextCursor: hasMore ? page[49]?.id ?? null : null,
    });
  } catch (err) {
    console.error("[API brew-logs GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = brewLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid brew log" }, { status: 400 });
    }

    const { blendId, recipeId, notes, rating, brewedAt } = parsed.data;

    const blend = await prisma.blend.findFirst({
      where: { id: blendId, userId: user.id },
    });
    if (!blend) {
      return NextResponse.json({ error: "Blend not found" }, { status: 404 });
    }

    if (recipeId) {
      const recipe = await prisma.recipe.findFirst({
        where: { id: recipeId, userId: user.id, blendId },
      });
      if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      }
    }

    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.brewLog.create({
        data: {
          userId: user.id,
          blendId,
          recipeId: recipeId ?? null,
          notes: notes ?? null,
          rating: rating ?? null,
          brewedAt: brewedAt ?? new Date(),
        },
        include: {
          blend: { select: { id: true, name: true } },
          recipe: { select: { id: true, name: true } },
        },
      });

      if (recipeId) {
        await tx.recipe.update({
          where: { id: recipeId },
          data: {
            brewCount: { increment: 1 },
            lastBrewed: brewedAt ?? new Date(),
          },
        });
      }

      return created;
    });

    const recentLogs = await prisma.brewLog.findMany({
      where: { userId: user.id },
      orderBy: { brewedAt: "desc" },
      take: 60,
      select: { brewedAt: true },
    });

    return NextResponse.json(
      { ...log, streak: calcStreak(recentLogs) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API brew-logs POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
