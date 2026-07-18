import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** Clone blend as next version in the lineage tree. */
export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const versionNotes = typeof body.versionNotes === "string" ? body.versionNotes.trim() : "";

  const source = await prisma.blend.findFirst({
    where: { id, userId: user.id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      childVersions: { select: { version: true } },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Blend not found" }, { status: 404 });
  }

  const rootId = source.parentBlendId ?? source.id;
  const maxVersion = Math.max(
    source.version,
    ...source.childVersions.map((v) => v.version),
    0
  );
  const nextVersion = maxVersion + 1;

  const created = await prisma.blend.create({
    data: {
      name: `${source.name} v${nextVersion}`,
      description: source.description,
      brewTemp: source.brewTemp,
      brewTime: source.brewTime,
      version: nextVersion,
      versionNotes: versionNotes || `Version ${nextVersion}`,
      parentBlendId: rootId,
      userId: user.id,
      ingredients: {
        create: source.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          amount: ing.amount,
          unit: ing.unit,
          order: ing.order,
        })),
      },
    },
    include: {
      ingredients: { include: { ingredient: true }, orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
