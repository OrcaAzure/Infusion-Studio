import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ blendId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { blendId } = await context.params;

  await prisma.favoriteBlend.deleteMany({
    where: { userId: user.id, blendId },
  });

  return NextResponse.json({ success: true });
}
