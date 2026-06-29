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

  const body = await request.json();
  const { socialHandle, name } = body as { socialHandle?: string; name?: string };

  const data: { socialHandle?: string; name?: string } = {};

  if (socialHandle !== undefined) {
    const handle = socialHandle.replace(/^@/, "").toLowerCase().trim();
    if (!handle || handle.length < 3) {
      return NextResponse.json({ error: "Handle must be at least 3 characters" }, { status: 400 });
    }
    data.socialHandle = handle;
  }

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    data.name = trimmed;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { socialHandle: true, name: true, email: true },
  });

  return NextResponse.json(updated);
}

export const PATCH = PUT;
