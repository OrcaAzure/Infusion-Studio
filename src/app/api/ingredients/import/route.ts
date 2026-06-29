import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { ingredientImportSchema } from "@/lib/validations/brew-log";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = ingredientImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid import data" }, { status: 400 });
    }

    const created = await prisma.$transaction(
      parsed.data.ingredients.map((row) =>
        prisma.ingredient.create({
          data: {
            name: row.name,
            category: row.category,
            quantity: row.quantity,
            unit: row.unit,
            pricePerUnit: row.pricePerUnit ?? null,
            flavorNotes: [],
            userId: user.id,
          },
        })
      )
    );

    return NextResponse.json({ imported: created.length, ingredients: created }, { status: 201 });
  } catch (err) {
    console.error("[API ingredients import]", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
