import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { ingredientSchema, ingredientFilterSchema } from "@/lib/validations/ingredient";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const filters = ingredientFilterSchema.safeParse(params);

  if (!filters.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const { search, category, sortBy, sortOrder } = filters.data;

  const where: Prisma.IngredientWhereInput = {
    userId: user.id,
    ...(category && { category }),
    ...(search && {
      name: { contains: search },
    }),
  };

  const ingredients = await prisma.ingredient.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: { _count: { select: { blendItems: true } } },
  });

  return NextResponse.json(ingredients);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = ingredientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ingredient = await prisma.ingredient.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        userId: user.id,
      },
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 });
  }
}
