import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

function run(command) {
  const result = spawnSync(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npx prisma generate");

if (process.env.DATABASE_URL.startsWith("file:")) {
  run("npx prisma db push --accept-data-loss --skip-generate");
  run("npx tsx prisma/seed.ts");
}

run("npx next build");
