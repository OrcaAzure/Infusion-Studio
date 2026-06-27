import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.recipe.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const body = await request.json();
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.brewCount !== undefined && { brewCount: body.brewCount }),
        ...(body.lastBrewed !== undefined && { lastBrewed: new Date(body.lastBrewed) }),
        ...(body.isShared !== undefined && { isShared: body.isShared }),
        ...(body.shareTitle !== undefined && { shareTitle: body.shareTitle }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      },
      include: {
        blend: {
          include: {
            ingredients: { include: { ingredient: true }, orderBy: { order: "asc" } },
          },
        },
      },
    });

    return NextResponse.json(recipe);
  } catch {
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.recipe.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
