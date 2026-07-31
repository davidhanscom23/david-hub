import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("http://127.0.0.1:3000/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /continue in demo mode/i }).click();
  await page.waitForURL("**/today", { timeout: 15000 });

  await page.getByPlaceholder(/notes on energy/i).fill("Playwright journal note");
  await page.getByRole("button", { name: /save journal/i }).click();
  await page.waitForTimeout(400);
  await page.getByRole("link", { name: "Progress" }).click();
  await page.waitForURL("**/progress");
  console.log(
    "journal_on_progress",
    (await page.locator("text=Playwright journal note").count()) > 0,
  );

  await page.getByRole("link", { name: "Routine" }).click();
  await page.waitForURL("**/routine");
  await page.locator('[role="tab"]').filter({ hasText: /^B$/ }).click();
  await page.waitForTimeout(200);
  console.log("tab_b_step_up", await page.locator("text=Step-Up").first().isVisible());
  await page.locator('[role="tab"]').filter({ hasText: /^C$/ }).click();
  await page.waitForTimeout(200);
  console.log(
    "tab_c_elbow",
    await page.locator("text=Elbow Walkout").first().isVisible(),
  );

  await page.getByRole("tab", { name: "All Exercises" }).click();
  await page.getByRole("link", { name: /Modified Burpee/i }).click();
  await page.waitForURL("**/exercise/modified-burpee");
  console.log(
    "exercise_detail_demo",
    (await page.getByRole("link", { name: /open official demo/i }).count()) > 0,
  );

  await page.getByRole("link", { name: "Today" }).click();
  await page.waitForURL("**/today");
  await page.getByRole("button", { name: "Do this today" }).first().click();
  await page.waitForTimeout(500);
  const start = page.getByRole("button", { name: /start workout|continue workout/i });
  console.log("workout_controls_visible", await start.first().isVisible());
  const startOnly = page.getByRole("button", { name: /^start workout$/i });
  if (await startOnly.isVisible().catch(() => false)) await startOnly.click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Done" }).first().click();
  await page.getByRole("button", { name: /mark workout complete/i }).click();
  await page.waitForTimeout(400);

  await page.getByRole("link", { name: "Progress" }).click();
  await page.waitForURL("**/progress");
  console.log(
    "week_1_of_3",
    await page.locator("text=1/3").first().isVisible().catch(() => false),
  );
  console.log("page_errors", errors);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
