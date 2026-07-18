#!/usr/bin/env node
/** Lightweight API smoke test — run with dev server on :3000 */
const base = process.env.QA_BASE ?? "http://localhost:3000";
let fail = 0;

async function check(path, fn) {
  try {
    const r = await fetch(`${base}${path}`);
    if (!fn(r)) {
      console.error(`FAIL ${path} -> ${r.status}`);
      fail++;
    } else {
      console.log(`OK   ${path}`);
    }
  } catch (e) {
    console.error(`FAIL ${path} -> ${e.message}`);
    fail++;
  }
}

await check("/api/dashboard", (r) => r.ok);
await check("/api/blends", (r) => r.ok);
await check("/api/ingredients", (r) => r.ok);
await check("/api/brew-logs", (r) => r.ok);
await check("/api/export", (r) => r.ok);

if (fail) process.exit(1);
console.log("API_SMOKE_OK");
