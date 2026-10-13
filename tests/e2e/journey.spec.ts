import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("guest classroom and multilingual explanation switching", async ({
  page,
}) => {
  await page.goto("/learn");
  await page
    .getByLabel("Learning topic", { exact: true })
    .fill("Electrical transformers");
  await page.getByRole("button", { name: "Open my classroom" }).click();
  await page.getByRole("button", { name: "Teach me this topic" }).click();
  await expect(
    page.getByText("Curated demonstration · not live inference"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Step by step", exact: true }).click();
  await expect(page.locator("article .lesson")).toContainText("1. Apply AC");
  await page
    .getByRole("button", { name: "Show a diagram", exact: true })
    .click();
  await expect(
    page.getByRole("img", {
      name: "Alternating current leads to Changing core flux leads to Induced voltage",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explain in Telugu", exact: true })
    .click();
  await expect(page.locator("article .lesson")).toContainText("అయస్కాంత");
  await page
    .getByRole("button", { name: "Explain in Hindi", exact: true })
    .click();
  await expect(page.locator("article .lesson")).toContainText("चुंबकीय");
});
test("diagnosis, reteaching, post-test, and persistence", async ({ page }) => {
  await page.goto("/assessment");
  await page.getByLabel("Steady DC", { exact: true }).check();
  await page.getByLabel("20 V", { exact: true }).check();
  await page.getByRole("button", { name: "Evaluate my answers" }).click();
  await expect(page.getByText("1 of 2 correct · 50%")).toBeVisible();
  await expect(page.getByText("Possible gap: changing-flux")).toBeVisible();
  await page
    .getByRole("link", { name: "Revisit with a simpler explanation" })
    .click();
  await page.getByRole("button", { name: "Teach me this topic" }).click();
  await expect(page.locator("article .lesson")).toContainText(
    "Change is the key",
  );
  await page.goto("/assessment?mode=practice");
  await page.getByLabel("No", { exact: true }).check();
  await page.getByLabel("12 V", { exact: true }).check();
  await page.getByRole("button", { name: "Evaluate my answers" }).click();
  await expect(page.getByText("2 of 2 correct · 100%")).toBeVisible();
  await page.goto("/progress");
  await expect(
    page.getByText("Electrical transformers", { exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Completed assessments")).toBeVisible();
});
test("interactive labs", async ({ page }) => {
  await page.goto("/labs");
  await page.getByLabel("Supply type").selectOption("dc");
  await expect(page.getByRole("status")).toContainText("0 V");
  await page.getByRole("button", { name: "Python trace", exact: true }).click();
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByRole("status")).toContainText("Final output: 1");
  await page
    .getByRole("button", { name: "Quadratic graph", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Roots: 3.000 and 2.000",
  );
});
test("keyboard, accessibility, useful routes, and no horizontal overflow", async ({
  page,
}, testInfo) => {
  for (const route of [
    "/",
    "/learn",
    "/classroom",
    "/assessment",
    "/roadmap",
    "/progress",
    "/labs",
    "/settings",
    "/about",
    "/privacy",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(scan.violations, route).toEqual([]);
  }
  await page.goto("/");
  await page.screenshot({
    path: `docs/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
test("API rejects invalid input and cross-origin requests", async ({
  request,
}) => {
  const loopback = await request.post("http://127.0.0.1:3000/api/tutor", {
    headers: { Origin: "http://127.0.0.1:3000" },
    data: { topic: "Python" },
  });
  expect(loopback.status()).toBe(200);
  expect((await loopback.json()).demo).toBe(true);
  expect(
    (await request.post("/api/tutor", { data: { topic: "x" } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/tutor", {
        headers: { Origin: "https://attacker.example" },
        data: { topic: "Python" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/tutor", {
        data: "not-json",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
});
