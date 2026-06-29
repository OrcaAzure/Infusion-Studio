import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function likeCount(recipeId: string) {
  return prisma.recipeLike.count({ where: { recipeId } });
}

export async function POST(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: recipeId } = await context.params;

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, isShared: true },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  await prisma.recipeLike.upsert({
    where: { userId_recipeId: { userId: user.id, recipeId } },
    create: { userId: user.id, recipeId },
    update: {},
  });

  const count = await likeCount(recipeId);
  return NextResponse.json({ liked: true, count });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: recipeId } = await context.params;

  await prisma.recipeLike.deleteMany({
    where: { userId: user.id, recipeId },
  });

  const count = await likeCount(recipeId);
  return NextResponse.json({ liked: false, count });
}
