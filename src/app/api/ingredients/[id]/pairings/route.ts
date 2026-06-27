import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { findPairings } from "@/lib/pairings";

type RouteContext = { params: Promise<{ id: string }> };

/** Returns recommended ingredients that pair well with the given ingredient */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const [target, allIngredients] = await Promise.all([
    prisma.ingredient.findFirst({ where: { id, userId: user.id } }),
    prisma.ingredient.findMany({ where: { userId: user.id } }),
  ]);

  if (!target) {
    return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
  }

  const pairings = findPairings(target, allIngredients);

  return NextResponse.json(pairings);
}
