import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { notes } = await request.json();

  const existing = await prisma.brewLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.brewLog.update({
    where: { id },
    data: { notes: notes ?? null },
    include: {
      blend: { select: { id: true, name: true } },
      recipe: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
