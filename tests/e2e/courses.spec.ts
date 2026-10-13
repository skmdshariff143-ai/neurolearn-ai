import { test, expect } from "@playwright/test";
function textPDF(text: string) {
  const stream = `BT /F1 12 Tf 50 750 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
test("course diagnostic, on-demand lesson, assessment completion and resume", async ({
  page,
}) => {
  await page.goto("/roadmap");
  await page.getByRole("button", { name: "Create learning course" }).click();
  await page.getByRole("button", { name: "Load diagnostic questions" }).click();
  await page.getByLabel("Steady DC", { exact: true }).check();
  await page.getByLabel("20 V", { exact: true }).check();
  await page.getByRole("button", { name: "Record course assessment" }).click();
  await expect(
    page.getByText("Possible revision concepts: changing-flux", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open personalized lesson" }).click();
  await page.getByRole("button", { name: "Load practice questions" }).click();
  await page.getByLabel("No", { exact: true }).check();
  await page.getByLabel("12 V", { exact: true }).check();
  await page.getByRole("button", { name: "Record course assessment" }).click();
  await expect(
    page.getByText("1/3 lesson checks completed", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("1/3 lesson checks completed", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Module 2:/ }).click();
  await expect(
    page.getByRole("button", { name: "Load diagnostic questions" }),
  ).toBeVisible();
});
test("PDF extraction, retrieval, rejection and explicit document consent", async ({
  page,
}) => {
  await page.goto("/learn");
  await page.getByLabel("Add a text-based PDF").setInputFiles({
    name: "fake.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.locator('section [role="alert"]')).toContainText(
    "Unable to read",
  );
  await page
    .getByLabel("Add a text-based PDF")
    .setInputFiles({
      name: "notes.pdf",
      mimeType: "application/pdf",
      buffer: textPDF("Transformers use changing magnetic flux for induction."),
    });
  await expect(page.getByRole("heading", { name: "notes.pdf" })).toBeVisible();
  await page.getByLabel("Find a passage in your notes").fill("magnetic");
  await expect(page.locator("blockquote")).toContainText(
    "changing magnetic flux",
  );
  await page.goto("/classroom");
  await page
    .getByLabel("Use your PDF notes")
    .selectOption({ label: "notes.pdf" });
  await page.getByRole("button", { name: "Teach me this topic" }).click();
  await expect(
    page.getByText("Consent is required", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("I consent to send", { exact: false }).check();
  await page.getByRole("button", { name: "Teach me this topic" }).click();
  await expect(
    page.getByText("Research-to-lesson requires a live provider", {
      exact: false,
    }),
  ).toBeVisible();
  await page.goto("/learn");
  await page
    .getByRole("button", { name: "Delete notes.pdf", exact: true })
    .click();
  await expect(page.getByText("No saved notes yet.")).toBeVisible();
});
