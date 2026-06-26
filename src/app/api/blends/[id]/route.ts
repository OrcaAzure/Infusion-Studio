import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { blendSchema } from "@/lib/validations/blend";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const blend = await prisma.blend.findFirst({
    where: { id, userId: user.id },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { order: "asc" },
      },
      recipes: { orderBy: { updatedAt: "desc" } },
      favorites: { where: { userId: user.id } },
      _count: { select: { recipes: true, favorites: true } },
    },
  });

  if (!blend) {
    return NextResponse.json({ error: "Blend not found" }, { status: 404 });
  }

  return NextResponse.json(blend);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.blend.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Blend not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = blendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, brewTemp, brewTime, ingredients } = parsed.data;

    // Replace ingredients atomically
    const blend = await prisma.$transaction(async (tx) => {
      await tx.blendIngredient.deleteMany({ where: { blendId: id } });
      return tx.blend.update({
        where: { id },
        data: {
          name,
          description,
          brewTemp,
          brewTime,
          ingredients: {
            create: ingredients.map((ing, index) => ({
              ingredientId: ing.ingredientId,
              amount: ing.amount,
              unit: ing.unit,
              order: ing.order ?? index,
            })),
          },
        },
        include: {
          ingredients: { include: { ingredient: true }, orderBy: { order: "asc" } },
        },
      });
    });

    return NextResponse.json(blend);
  } catch {
    return NextResponse.json({ error: "Failed to update blend" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.blend.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Blend not found" }, { status: 404 });
  }

  await prisma.blend.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
