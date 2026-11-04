import { test, expect } from "@playwright/test";
for (const dark of [false, true]) {
  test(`uploaded video plays muted and pauses after onboarding in ${dark ? "dark" : "light"} mode`, async ({
    page,
  }) => {
    await page.addInitScript(
      (dark) =>
        localStorage.setItem(
          "sound-room.confirmed-design.v1",
          JSON.stringify({ dark, en: true, onboarded: false }),
        ),
      dark,
    );
    await page.goto("/?welcome=1");
    const video = page.getByTestId("splash-video");
    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).currentTime))
      .toBeGreaterThan(0.2);
    expect(
      await video.evaluate((el) => {
        const v = el as HTMLVideoElement;
        return {
          muted: v.muted,
          loop: v.loop,
          inline: v.playsInline,
          width: v.videoWidth,
          height: v.videoHeight,
          controls: v.controls,
        };
      }),
    ).toEqual({
      muted: true,
      loop: true,
      inline: true,
      width: 720,
      height: 1280,
      controls: false,
    });
    const title = page.getByText("Sound Room", { exact: true });
    const box = await title.boundingBox();
    await video.evaluate((el) => {
      (el as HTMLVideoElement).currentTime = 9.8;
    });
    await expect
      .poll(
        () => video.evaluate((el) => (el as HTMLVideoElement).currentTime),
        { timeout: 10000 },
      )
      .toBeLessThan(2);
    expect(await title.boundingBox()).toEqual(box);
    await page
      .getByRole("button", { name: "Start onboarding", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Skip", exact: true }),
    ).toBeInViewport();
    await expect
      .poll(() => video.evaluate((el) => (el as HTMLVideoElement).paused))
      .toBe(true);
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await expect(video).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Open player", exact: true }),
    ).toBeVisible();
  });
}
test("reduced motion starts with a poster and manual video playback stays on splash", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?welcome=1");
  const video = page.getByTestId("splash-video");
  await expect(
    page.getByRole("button", { name: "Play background video", exact: true }),
  ).toBeVisible();
  expect(await video.evaluate((el) => (el as HTMLVideoElement).paused)).toBe(
    true,
  );
  await page
    .getByRole("button", { name: "Play background video", exact: true })
    .click();
  await expect
    .poll(() => video.evaluate((el) => (el as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.1);
  await expect(
    page.getByRole("button", { name: "Start onboarding", exact: true }),
  ).toBeInViewport();
});
test("video network failure keeps the poster and onboarding usable", async ({
  page,
}) => {
  await page.route("**/*.mp4*", (route) => route.abort());
  await page.goto("/?welcome=1");
  await expect(
    page.getByRole("button", { name: "Start onboarding", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("splash-video")).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator('img[src*="splash-star-poster"]')
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(720);
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Skip", exact: true }),
  ).toBeInViewport();
});
