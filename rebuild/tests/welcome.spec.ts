import { test, expect, type Page } from "@playwright/test";
test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
async function swipe(page: Page, from: number, to: number, y = 400) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: from, y }],
  });
  for (let i = 1; i <= 12; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: from + ((to - from) * i) / 12, y }],
    });
    await page.waitForTimeout(25);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
}
async function atPage(page: Page, index: number) {
  await expect
    .poll(() =>
      page
        .getByTestId("welcome-pager")
        .evaluate((el) => Math.round(el.scrollLeft / el.clientWidth)),
    )
    .toBe(index);
  await expect
    .poll(() =>
      page
        .getByTestId("welcome-pager")
        .evaluate((el) =>
          Math.abs(
            el.scrollLeft / el.clientWidth -
              Math.round(el.scrollLeft / el.clientWidth),
          ),
        ),
    )
    .toBeLessThan(0.01);
}
test("start screen stays, and touch swipes connect all four pages in both directions", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Start onboarding", exact: true }),
  ).toBeVisible();
  await page.clock.install();
  await page.clock.fastForward(10000);
  await atPage(page, 0);
  await page.clock.resume();
  for (const next of [1, 2, 3]) {
    await swipe(page, 325, 55);
    await atPage(page, next);
  }
  for (const prev of [2, 1, 0]) {
    await swipe(page, 55, 325);
    await atPage(page, prev);
  }
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .tap();
  await atPage(page, 1);
  await page.getByRole("button", { name: "Next", exact: true }).tap();
  await atPage(page, 2);
  await page.getByRole("button", { name: "Next", exact: true }).tap();
  await atPage(page, 3);
  await page.getByRole("button", { name: "Get started", exact: true }).tap();
  await expect(page.getByTestId("welcome-pager")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open player", exact: true }),
  ).toBeVisible();
});
test("resize retains page; vertical gestures do not change onboarding; review preserves saved data", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .tap();
  await atPage(page, 1);
  await page.setViewportSize({ width: 360, height: 740 });
  await atPage(page, 1);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 170, y: 570 }],
  });
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 170 + i / 2, y: 570 - i * 20 }],
    });
    await page.waitForTimeout(20);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.detach();
  await atPage(page, 1);
  await page.getByRole("button", { name: "Skip", exact: true }).tap();
  await page.getByRole("button", { name: "My", exact: true }).tap();
  await page.getByText("Theme", { exact: true }).tap();
  const before = await page.evaluate(() =>
    localStorage.getItem("sound-room.confirmed-design.v1"),
  );
  await page.goto("/?welcome=1");
  await atPage(page, 0);
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .tap();
  await page.getByRole("button", { name: "Skip", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "Open player", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("sound-room.confirmed-design.v1"),
    ),
  ).toBe(before);
});
