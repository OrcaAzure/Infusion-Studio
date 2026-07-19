#!/usr/bin/env node
/** Cross-platform web QA (routes + APIs on localhost:3000). */
const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
let fail = 0;

async function testRoute(path, expect = 200) {
  try {
    const res = await fetch(`${base}${path}`, { redirect: "manual" });
    const code = res.status;
    if (code === expect) {
      console.log(`OK   ${path} -> ${code}`);
    } else {
      console.error(`FAIL ${path} -> ${code} (expected ${expect})`);
      fail++;
    }
  } catch (err) {
    console.error(`FAIL ${path} -> ${err.message}`);
    fail++;
  }
}

console.log(`Web QA against ${base}`);

const routes = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/ingredients",
  "/ingredients/new",
  "/blends",
  "/blends/create",
  "/timer",
  "/brew-logs",
  "/recipes",
  "/favorites",
  "/settings",
  "/oven-infusion",
  "/qa",
  "/blends/seed-blend-1",
  "/ingredients/seed-ing-1",
];

for (const path of routes) {
  await testRoute(path);
}

async function testJson(path, validate) {
  try {
    const res = await fetch(`${base}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (validate(data)) {
      console.log(`OK   ${path}`);
    } else {
      console.error(`FAIL ${path} -> invalid response`);
      fail++;
    }
  } catch (err) {
    console.error(`FAIL ${path} -> ${err.message}`);
    fail++;
  }
}

await testJson("/api/dashboard", (d) => d.totalIngredients > 0);
await testJson("/api/blends", (d) => Array.isArray(d) && d.length > 0);
await testJson("/api/ingredients", (d) => Array.isArray(d) && d.length > 0);
await testJson("/api/brew-logs", (d) => d.logs != null);

if (fail === 0) {
  console.log("WEB_QA_OK");
  process.exit(0);
}
console.error(`WEB_QA_FAILED (${fail} issues)`);
process.exit(1);
