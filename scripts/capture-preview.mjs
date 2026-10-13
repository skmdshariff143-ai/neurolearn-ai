import { chromium } from "@playwright/test";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto("http://localhost:3000/classroom");
  await page.getByRole("button", { name: "Teach me this topic" }).click();
  await page.locator("article .lesson").waitFor();
  await page.screenshot({
    path: "docs/screenshots/classroom-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/classroom-mobile.png",
    fullPage: true,
  });
  console.log(
    "Captured the running fixture classroom at desktop and mobile viewports.",
  );
} finally {
  await browser.close();
}
