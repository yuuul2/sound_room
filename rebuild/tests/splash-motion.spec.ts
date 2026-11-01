import { test, expect, type Page } from "@playwright/test";
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const w = window as any;
    w.splashFrames = 0;
    w.splashPixel = 0;
    for (const constructor of [
      w.WebGLRenderingContext,
      w.WebGL2RenderingContext,
    ]) {
      if (!constructor) continue;
      const original = constructor.prototype.drawArrays;
      constructor.prototype.drawArrays = function (...args: any[]) {
        original.apply(this, args);
        w.splashFrames++;
        const pixel = new Uint8Array(4);
        this.readPixels(
          Math.floor(this.drawingBufferWidth / 2),
          Math.floor(this.drawingBufferHeight / 2),
          1,
          1,
          this.RGBA,
          this.UNSIGNED_BYTE,
          pixel,
        );
        w.splashPixel = pixel[0] + pixel[1] + pixel[2];
      };
    }
  });
}
for (const dark of [false, true])
  test(`${dark ? "dark" : "light"} original texture animates, pauses offscreen, and preserves paging`, async ({
    page,
  }) => {
    await instrument(page);
    await page.addInitScript((dark) => {
      localStorage.setItem(
        "sound-room.confirmed-design.v1",
        JSON.stringify({
          dark,
          en: true,
          onboarded: false,
          saved: [],
          favorites: [],
        }),
      );
    }, dark);
    await page.goto("/?welcome=1");
    await expect(page.getByTestId("splash-motion")).toHaveCSS("opacity", "1");
    await expect
      .poll(() => page.evaluate(() => (window as any).splashFrames))
      .toBeGreaterThan(5);
    expect(
      await page.evaluate(() => (window as any).splashPixel),
    ).toBeGreaterThan(0);
    const title = page.getByText("Sound Room", { exact: true });
    const initial = await title.boundingBox();
    const frames = await page.evaluate(() => (window as any).splashFrames);
    await expect
      .poll(() => page.evaluate(() => (window as any).splashFrames))
      .toBeGreaterThan(frames + 3);
    expect(await title.boundingBox()).toEqual(initial);
    await page
      .getByRole("button", { name: "Start onboarding", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Skip", exact: true }),
    ).toBeInViewport();
    await page.waitForTimeout(350);
    const paused = await page.evaluate(() => (window as any).splashFrames);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as any).splashFrames)).toBe(
      paused,
    );
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Open player", exact: true }),
    ).toBeVisible();
  });
test("reduced motion keeps the still image and onboarding remains usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?welcome=1");
  await expect(
    page.getByRole("button", { name: "Start onboarding", exact: true }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Play background motion", exact: true })
    .click();
  await expect(page.getByTestId("splash-motion")).toHaveCSS("opacity", "1");
  await expect(
    page.getByRole("button", { name: "Start onboarding", exact: true }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Open player", exact: true }),
  ).toBeVisible();
});
test("unavailable graphics animates the original image and pauses offscreen", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: any,
      ...args: any[]
    ) {
      if (String(type).includes("webgl")) return null;
      return (original as any).call(this, type, ...args);
    } as any;
  });
  await page.goto("/?welcome=1");
  await expect(
    page.getByRole("button", { name: "Start onboarding", exact: true }),
  ).toBeVisible();
  const fallback = page.getByTestId("splash-motion-fallback");
  await expect(fallback).toBeVisible();
  const first = await fallback.screenshot();
  await page.waitForTimeout(1200);
  expect((await fallback.screenshot()).equals(first)).toBe(false);
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await page.waitForTimeout(500);
  const time = await fallback.evaluate((svg) =>
    (svg as unknown as SVGSVGElement).getCurrentTime(),
  );
  await page.waitForTimeout(400);
  expect(
    await fallback.evaluate((svg) =>
      (svg as unknown as SVGSVGElement).getCurrentTime(),
    ),
  ).toBe(time);
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Open player", exact: true }),
  ).toBeVisible();
});
