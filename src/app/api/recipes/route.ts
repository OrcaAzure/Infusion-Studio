import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations/blend";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipes = await prisma.recipe.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      blend: {
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = recipeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, notes, rating, blendId } = parsed.data;

    const blend = await prisma.blend.findFirst({
      where: { id: blendId, userId: user.id },
    });
    if (!blend) {
      return NextResponse.json({ error: "Blend not found" }, { status: 404 });
    }

    const recipe = await prisma.recipe.create({
      data: { name, notes, rating, blendId, userId: user.id },
      include: {
        blend: {
          include: {
            ingredients: {
              include: { ingredient: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  }
}
