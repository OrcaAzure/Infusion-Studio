import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { ingredientSchema } from "@/lib/validations/ingredient";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const ingredient = await prisma.ingredient.findFirst({
    where: { id, userId: user.id },
    include: {
      blendItems: {
        include: {
          blend: { select: { id: true, name: true, createdAt: true } },
        },
        orderBy: { blend: { createdAt: "desc" } },
        take: 10,
      },
      _count: { select: { blendItems: true } },
    },
  });

  if (!ingredient) {
    return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
  }

  return NextResponse.json(ingredient);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.ingredient.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = ingredientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ingredient = await prisma.ingredient.update({
      where: { id },
      data: { ...data, imageUrl: data.imageUrl || null },
    });

    return NextResponse.json(ingredient);
  } catch {
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.ingredient.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
  }

  await prisma.ingredient.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
