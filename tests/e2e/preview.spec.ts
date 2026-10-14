import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("existing private browser records are ignored and preserved", async ({
  page,
}) => {
  await page.goto("/settings");
  const profile = {
    language: "Telugu",
    level: "Beginner",
    goal: "SYNTHETIC PRIVATE RECORD",
    minutes: 20,
    style: "lesson",
    reducedMotion: false,
  };
  await page.evaluate(
    (p) => localStorage.setItem("nl-profile", JSON.stringify(p)),
    profile,
  );
  await page.reload();
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue(
    "English",
  );
  await expect(page.getByLabel("Goal", { exact: true })).not.toHaveValue(
    profile.goal,
  );
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("nl-profile") ?? "null"),
    ),
  ).toEqual(profile);
});
test("preview has truthful fixtures and no persistent learner records", async ({
  page,
}) => {
  await page.goto("/classroom");
  await page.getByRole("button", { name: "Teach me this topic" }).click();
  await expect(
    page.getByText("Curated demonstration · not live inference"),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith("nl-")),
    ),
  ).toEqual([]);
  await page.reload();
  await expect(
    page.getByText("Curated demonstration · not live inference"),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Research with Tavily", { exact: false }),
  ).toBeDisabled();
  await page.goto("/learn");
  await expect(
    page.getByRole("heading", { name: "Document uploads disabled" }),
  ).toBeVisible();
  await expect(page.locator("input[type=file]")).toHaveCount(0);
  await page.goto("/roadmap");
  await expect(page.getByLabel("Course source")).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Save selected course to hosted storage",
    }),
  ).toBeDisabled();
});
test("preview APIs reject live research, uploads, access and storage", async ({
  request,
}) => {
  for (const path of ["/api/progress", "/api/library"])
    expect((await request.get(path)).status()).toBe(503);
  for (const path of [
    "/api/access",
    "/api/workflow",
    "/api/library",
    "/api/progress",
  ])
    expect((await request.post(path, { data: {} })).status()).toBe(503);
  expect(
    (
      await request.post("/api/tutor", {
        data: { topic: "Transformers", research: true },
      })
    ).status(),
  ).toBe(503);
  const status = await (await request.get("/api/status")).json();
  expect(status.provider).toBe("fixture");
  expect(status.safePreview).toBe(true);
  expect(status.persistence).toContain("Transient memory");
});
test("preview disclosures, keyboard and accessibility on every route", async ({
  page,
}) => {
  for (const path of [
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
    await page.goto(path);
    await expect(page.getByRole("note")).toContainText("no live AI inference");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
