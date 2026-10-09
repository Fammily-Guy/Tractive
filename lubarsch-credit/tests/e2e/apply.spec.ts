import { expect, test } from "@playwright/test";

// Runs at 360×740 (see playwright.config.ts) — the target phone size.
test("a trader can apply from the calculator and get a reference number", async ({ page }) => {
  await page.goto("/calculator");
  await expect(page.getByTestId("sentence")).toContainText("₦42,000");
  await page.getByRole("link", { name: /Apply with this amount/ }).click();
  await expect(page).toHaveURL(/\/apply\?product=daily&tenor=20-day&amount=50000/);

  // Step 1 — About you
  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Please write your full name").first()).toBeVisible(); // validation shows in plain language
  await page.getByLabel("Full name", { exact: true }).fill("Bisi Adeyemi");
  await page.getByLabel("Phone number", { exact: true }).fill("0803 123 4567");
  await page.getByText("Female", { exact: true }).click();
  await page.getByLabel("Date of birth").fill("1978-03-15");
  await page.getByLabel("Home address").fill("12 Oke Ado Road, Ibadan");
  await page.getByLabel("Local government area (LGA)").selectOption("Ibadan North");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2 — Business
  await expect(page.getByText("Step 2 of 5")).toBeVisible();
  await page.getByText("Foodstuff", { exact: true }).click();
  await page.getByLabel("Which market?").selectOption("bodija");
  await page.getByLabel("Shop or stall number / description").fill("Stall 14, Line C");
  await page.getByText("More than 5 years").click();
  await page.getByText("₦30,000 – ₦70,000").click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3 — Loan (pre-filled from the calculator)
  await expect(page.getByText("Step 3 of 5")).toBeVisible();
  await expect(page.getByLabel("How much do you need? (₦)")).toHaveValue("50000");
  await page.getByText("Buy stock / goods").click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 4 — ID & guarantor
  await expect(page.getByText("Step 4 of 5")).toBeVisible();
  await page.getByText("NIN slip / card").click();
  await page.getByLabel("ID number", { exact: true }).fill("12345678901");
  await page.getByLabel("BVN (11 digits)").fill("22233344455");
  await expect(page.getByLabel("BVN (11 digits)")).toHaveAttribute("type", "password");
  await page.getByLabel("Guarantor's full name").fill("Tunde Adeyemi");
  await page.getByLabel("Guarantor's phone number").fill("08099998888");
  await page.getByText("Husband / wife").click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 5 — Review: full cost shown, consent boxes NOT pre-ticked
  await expect(page.getByText("Step 5 of 5")).toBeVisible();
  await expect(page.getByText("The full cost of your loan")).toBeVisible();
  await expect(page.getByText("•••••••4455")).toBeVisible();
  const terms = page.getByRole("checkbox", { name: /Terms of service/ });
  const privacy = page.getByRole("checkbox", { name: /Privacy policy/ });
  await expect(terms).not.toBeChecked();
  await expect(privacy).not.toBeChecked();
  await terms.check();
  await privacy.check();
  await page.getByRole("button", { name: "Send my application" }).click();

  await expect(page).toHaveURL(/\/apply\/success\?ref=LBC-\d{4}-\d{6}/);
  const ref = (await page.getByTestId("reference").textContent())!.trim();
  expect(ref).toMatch(/^LBC-\d{4}-\d{6}$/);

  // No horizontal scrolling at 360px
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

  // Status check finds it
  await page.goto("/check-status");
  await page.getByLabel("Phone number", { exact: true }).fill("08031234567");
  await page.getByLabel("Reference number").fill(ref);
  await page.getByRole("button", { name: "Check status" }).click();
  await expect(page.getByText("Current status")).toBeVisible();
});

test("progress survives a reload (dropped connection)", async ({ page }) => {
  await page.goto("/apply");
  await page.getByLabel("Full name", { exact: true }).fill("Kemi Ola");
  await page.reload();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Kemi Ola");
});
