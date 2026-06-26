import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { blendSchema } from "@/lib/validations/blend";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search") ?? "";

  const where: Prisma.BlendWhereInput = {
    userId: user.id,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  const blends = await prisma.blend.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { recipes: true, favorites: true } },
    },
  });

  return NextResponse.json(blends);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = blendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, brewTemp, brewTime, ingredients } = parsed.data;

    const blend = await prisma.blend.create({
      data: {
        name,
        description,
        brewTemp,
        brewTime,
        userId: user.id,
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

    return NextResponse.json(blend, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create blend" }, { status: 500 });
  }
}
