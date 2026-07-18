import { test, expect } from "@playwright/test";

async function dismissOnboardingIfPresent(page: import("@playwright/test").Page) {
  for (let i = 0; i < 4; i++) {
    const skip = page.getByRole("button", { name: "Skip" });
    if (!(await skip.isVisible({ timeout: 500 }).catch(() => false))) break;
    await skip.click();
  }
}

async function enterLaboratory(page: import("@playwright/test").Page) {
  await page.goto("/");

  if (page.url().includes("/login")) {
    await page.getByRole("button", { name: /trial user/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    return;
  }

  const enterLab = page.getByTestId("welcome-enter-lab");
  if (await enterLab.isVisible().catch(() => false)) {
    await enterLab.click();
    await expect(page).toHaveURL(/\/dashboard/);
    return;
  }

  if (!page.url().includes("/dashboard")) {
    await page.goto("/dashboard");
  }
}

/**
 * Core user journey: welcome → laboratory → blend → timer → brew log.
 * Run with UI: npm run test:e2e:ui
 */
test.describe("Welcome → brew → log", () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem("hasSeenOnboardingV2", "true");
    });
  });

  test("completes the infusion session flow", async ({ page }) => {
    await enterLaboratory(page);
    await dismissOnboardingIfPresent(page);

    await page.goto("/blends/seed-blend-1", { waitUntil: "domcontentloaded" });
    await dismissOnboardingIfPresent(page);
    await expect(page.getByTestId("blend-start-timer")).toBeVisible({ timeout: 30_000 });

    await page.getByTestId("blend-start-timer").click({ force: true });
    await expect(page).toHaveURL(/\/timer/);
    await dismissOnboardingIfPresent(page);

    await page.locator('div:has(> label:text-is("Minutes")) input').fill("0");
    await page.getByTestId("timer-seconds").fill("5");
    await page.getByTestId("timer-set-duration").click();
    await page.getByTestId("brew-timer-start").click();

    await expect(page.getByText("Ready!")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /log this brew/i })).toBeVisible();

    await page.getByTestId("brew-log-save").click();
    await expect(page.getByRole("heading", { name: /brew session complete/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
