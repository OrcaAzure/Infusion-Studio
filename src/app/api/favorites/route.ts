import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favoriteBlend.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      blend: {
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: "asc" },
          },
          _count: { select: { recipes: true } },
        },
      },
    },
  });

  return NextResponse.json(favorites);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blendId } = await request.json();
    if (!blendId) {
      return NextResponse.json({ error: "blendId is required" }, { status: 400 });
    }

    const blend = await prisma.blend.findFirst({
      where: { id: blendId, userId: user.id },
    });
    if (!blend) {
      return NextResponse.json({ error: "Blend not found" }, { status: 404 });
    }

    const favorite = await prisma.favoriteBlend.upsert({
      where: { userId_blendId: { userId: user.id, blendId } },
      update: {},
      create: { userId: user.id, blendId },
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

    return NextResponse.json(favorite, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to favorite blend" }, { status: 500 });
  }
}
