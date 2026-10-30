import { test, expect, type Page } from "@playwright/test";
async function home(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
}
async function player(page: Page) {
  await page.getByRole("button", { name: "Open player", exact: true }).click();
}
test("first run onboarding, language and theme persist without repeating onboarding", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByText("Take a moment to rest", { exact: false }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Get started", exact: true }).click();
  await page.getByRole("button", { name: "My", exact: true }).click();
  await page.getByText("Language", { exact: true }).click();
  await page.getByText("배경 테마", { exact: true }).click();
  await expect(page.getByText("다크모드", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "마이", exact: true }).click();
  await expect(page.getByText("다크모드", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("save, reload, edit, duplicate and confirmed delete a mix", async ({
  page,
}) => {
  await home(page);
  await player(page);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("textbox", { name: "Mix name" }).fill("Evening waves");
  await page
    .getByRole("button", { name: "Save this atmosphere", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Evening waves", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page
    .getByRole("button", { name: "Menu Evening waves", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByRole("button", { name: "Play this atmosphere", exact: true })
    .click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("textbox", { name: "Mix name" }).fill("Evening sea");
  await page
    .getByRole("button", { name: "Save this atmosphere", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Evening waves", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Menu Evening sea", exact: true })
    .click();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Evening sea copy", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Menu Evening sea copy", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Evening sea copy", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Menu Evening sea copy", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Evening sea copy", exact: true }),
  ).toHaveCount(0);
});
test("timer validates custom input, counts down and all day cancels it", async ({
  page,
}) => {
  await home(page);
  await player(page);
  await page.getByRole("button", { name: "Timer", exact: true }).click();
  await page
    .getByRole("button", { name: "Custom duration", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Custom minutes", exact: true })
    .fill("0");
  await expect(
    page.getByRole("button", { name: "Start timer", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Custom minutes", exact: true })
    .fill("1");
  await page.getByRole("button", { name: "Start timer", exact: true }).click();
  await expect(page.getByLabel("Time remaining", { exact: true })).toHaveText(
    /^[01]:\d\d$/,
  );
  await page.getByRole("button", { name: "All day", exact: true }).click();
  await expect(page.getByLabel("Time remaining", { exact: true })).toHaveText(
    "—",
  );
});
test("search empty state and real playback controls", async ({ page }) => {
  await home(page);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search atmospheres", exact: true })
    .fill("zzzzzzz");
  await expect(
    page.getByText("No atmospheres found.", { exact: true }),
  ).toBeVisible();
  await player(page);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
});
test("English screens stay within narrow viewport and navigation stays visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await home(page);
  for (const screen of ["My", "Library", "Home"]) {
    await page.getByRole("button", { name: screen, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Open player", exact: true }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  await page
    .getByRole("button", { name: "Play this atmosphere", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Play this atmosphere", exact: true }),
  ).toBeInViewport();
});
