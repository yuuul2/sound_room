import { test, expect } from "@playwright/test";
for (const [width, height, en] of [
  [390, 844, false],
  [320, 568, true],
] as const) {
  test(`last onboarding fits ${width}x${height}; only banners move inside the box`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(
      (en) =>
        localStorage.setItem(
          "sound-room.confirmed-design.v1",
          JSON.stringify({ en, onboarded: false }),
        ),
      en,
    );
    await page.goto("/?welcome=1");
    await page
      .getByRole("button", {
        name: en ? "Start onboarding" : "온보딩 시작",
        exact: true,
      })
      .click();
    const firstTitle = page.getByText(
      en
        ? "Mix the sounds of nature freely"
        : "자연의 소리를 자유롭게 섞어보세요",
      { exact: true },
    );
    await expect(page.getByTestId("welcome-scene-1")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    const firstTitleBox = await firstTitle.boundingBox();
    await page
      .getByRole("button", {
        name: en ? "Onboarding 3" : "온보딩 3",
        exact: true,
      })
      .click();
    await expect(page.getByTestId("welcome-scene-3")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    const title = page.getByText(
      en
        ? "Return to your favorite atmospheres"
        : "좋아하는 분위기를 다시 꺼내 들어보세요",
      { exact: true },
    );
    const titleBox = await title.boundingBox();
    expect(titleBox!.y).toBeCloseTo(firstTitleBox!.y, 0);
    const footer = page.getByRole("button", {
      name: en ? "Get started" : "시작하기",
      exact: true,
    });
    await expect(footer).toBeInViewport({ ratio: 1 });
    const box = page.getByTestId("saved-atmospheres-preview");
    const clip = page.getByTestId("saved-atmospheres-window");
    const track = page.getByTestId("saved-atmospheres-track");
    await expect(clip).toHaveCSS("overflow", "hidden");
    const initial = await track.boundingBox();
    const boxBefore = await box.boundingBox();
    await page.waitForTimeout(600);
    expect((await track.boundingBox())!.y).toBeGreaterThan(initial!.y + 3);
    expect(await box.boundingBox()).toEqual(boxBefore);
    expect(await title.boundingBox()).toEqual(titleBox);
    const clipBox = await clip.boundingBox();
    expect(clipBox!.y + clipBox!.height).toBeLessThanOrEqual(
      (await footer.boundingBox())!.y,
    );
    await page
      .getByRole("button", {
        name: en ? "Pause banner motion" : "배너 자동 이동 일시정지",
        exact: true,
      })
      .click();
    await page.waitForTimeout(80);
    const paused = await track.boundingBox();
    await page.waitForTimeout(300);
    expect(await track.boundingBox()).toEqual(paused);
    await page
      .getByRole("button", {
        name: en ? "Play banner motion" : "배너 자동 이동 재생",
        exact: true,
      })
      .click();
    await page.waitForTimeout(300);
    expect((await track.boundingBox())!.y).toBeGreaterThan(paused!.y);
    await page
      .getByRole("button", {
        name: en ? "Onboarding 2" : "온보딩 2",
        exact: true,
      })
      .click();
    await expect(page.getByTestId("welcome-scene-2")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await page.waitForTimeout(100);
    const hidden = await track.boundingBox();
    await page.waitForTimeout(300);
    expect(await track.boundingBox()).toEqual(hidden);
  });
}
test("reduced motion keeps the inner list still until explicitly played", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?welcome=1");
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await page.getByRole("button", { name: "Onboarding 3", exact: true }).click();
  await expect(page.getByTestId("saved-atmospheres-static")).toBeVisible();
  await expect(page.getByTestId("saved-atmospheres-track")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Play banner motion", exact: true })
    .click();
  await expect(page.getByTestId("saved-atmospheres-track")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Get started", exact: true }),
  ).toBeInViewport();
});
