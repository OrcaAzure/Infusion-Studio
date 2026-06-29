import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const stockSchema = z.object({
  delta: z.coerce.number(),
});

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await _req.json();
    const parsed = stockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid delta" }, { status: 400 });
    }

    const existing = await prisma.ingredient.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextQty = Math.max(0, existing.quantity + parsed.data.delta);
    const updated = await prisma.ingredient.update({
      where: { id },
      data: { quantity: nextQty },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[API ingredients stock]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
