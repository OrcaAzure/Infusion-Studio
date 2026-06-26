import { PrismaClient, IngredientCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Easy trial login — use these credentials at /login
  const trialPassword = await bcrypt.hash("trial123", 12);

  const user = await prisma.user.upsert({
    where: { email: "trial@trial.com" },
    update: { password: trialPassword },
    create: {
      name: "Trial User",
      email: "trial@trial.com",
      password: trialPassword,
    },
  });

  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { id: "seed-ing-1" },
      update: {},
      create: {
        id: "seed-ing-1",
        name: "Sencha Green Tea",
        description: "Classic Japanese green tea with grassy, umami notes.",
        category: IngredientCategory.TEA,
        origin: "Japan",
        flavorNotes: ["grassy", "umami", "vegetal"],
        quantity: 250,
        unit: "g",
        pricePerUnit: 0.08,
        userId: user.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-ing-2" },
      update: {},
      create: {
        id: "seed-ing-2",
        name: "Chamomile Flowers",
        description: "Dried chamomile blossoms for calming herbal infusions.",
        category: IngredientCategory.FLOWER,
        origin: "Egypt",
        flavorNotes: ["floral", "honey", "apple"],
        quantity: 100,
        unit: "g",
        pricePerUnit: 0.12,
        userId: user.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-ing-3" },
      update: {},
      create: {
        id: "seed-ing-3",
        name: "Fresh Ginger Root",
        description: "Warming spice with bright, peppery heat.",
        category: IngredientCategory.SPICE,
        origin: "India",
        flavorNotes: ["spicy", "warm", "citrus"],
        quantity: 150,
        unit: "g",
        pricePerUnit: 0.05,
        userId: user.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-ing-4" },
      update: {},
      create: {
        id: "seed-ing-4",
        name: "Dried Lavender",
        description: "Fragrant purple buds for aromatic blends.",
        category: IngredientCategory.FLOWER,
        origin: "France",
        flavorNotes: ["floral", "herbal", "sweet"],
        quantity: 50,
        unit: "g",
        pricePerUnit: 0.15,
        userId: user.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-ing-5" },
      update: {},
      create: {
        id: "seed-ing-5",
        name: "Peppermint Leaves",
        description: "Cooling mint for refreshing infusions.",
        category: IngredientCategory.HERB,
        origin: "USA",
        flavorNotes: ["cool", "minty", "fresh"],
        quantity: 80,
        unit: "g",
        pricePerUnit: 0.1,
        userId: user.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: "seed-ing-6" },
      update: {},
      create: {
        id: "seed-ing-6",
        name: "Dried Orange Peel",
        description: "Bright citrus zest for uplifting blends.",
        category: IngredientCategory.FRUIT,
        origin: "Spain",
        flavorNotes: ["citrus", "sweet", "bright"],
        quantity: 60,
        unit: "g",
        pricePerUnit: 0.09,
        userId: user.id,
      },
    }),
  ]);

  const blend = await prisma.blend.upsert({
    where: { id: "seed-blend-1" },
    update: {},
    create: {
      id: "seed-blend-1",
      name: "Calm Evening Blend",
      description: "A soothing mix of chamomile, lavender, and mint.",
      brewTemp: 90,
      brewTime: 300,
      userId: user.id,
      ingredients: {
        create: [
          { ingredientId: ingredients[1].id, amount: 3, unit: "g", order: 0 },
          { ingredientId: ingredients[3].id, amount: 1, unit: "g", order: 1 },
          { ingredientId: ingredients[4].id, amount: 2, unit: "g", order: 2 },
        ],
      },
    },
  });

  await prisma.recipe.upsert({
    where: { id: "seed-recipe-1" },
    update: {},
    create: {
      id: "seed-recipe-1",
      name: "My Evening Ritual",
      notes: "Perfect before bed. Steep covered for 5 minutes.",
      rating: 5,
      brewCount: 12,
      lastBrewed: new Date(),
      blendId: blend.id,
      userId: user.id,
    },
  });

  await prisma.favoriteBlend.upsert({
    where: { userId_blendId: { userId: user.id, blendId: blend.id } },
    update: {},
    create: { userId: user.id, blendId: blend.id },
  });

  console.log("Seed complete. Trial login: trial@trial.com / trial123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
