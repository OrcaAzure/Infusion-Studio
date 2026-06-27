import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { socialHandle: true, name: true, email: true },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { socialHandle } = await request.json();
  const handle = (socialHandle as string)
    .replace(/^@/, "")
    .toLowerCase()
    .trim();

  if (!handle || handle.length < 3) {
    return NextResponse.json({ error: "Handle must be at least 3 characters" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { socialHandle: handle },
    select: { socialHandle: true, name: true },
  });

  return NextResponse.json(updated);
}
