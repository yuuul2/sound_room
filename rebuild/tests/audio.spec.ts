import { test, expect, type Page } from "@playwright/test";
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const w = window as any;
    const Base = w.AudioContext;
    w.audioTest = { contexts: [], gains: [], sources: [] };
    w.AudioContext = class extends Base {
      constructor(...args: any[]) {
        super(...args);
        w.audioTest.contexts.push(this);
        const gain = this.createGain.bind(this);
        this.createGain = () => {
          const g = gain();
          w.audioTest.gains.push(g);
          return g;
        };
        const source = this.createBufferSource.bind(this);
        this.createBufferSource = () => {
          const s = source();
          w.audioTest.sources.push(s);
          return s;
        };
        const analyser = this.createAnalyser();
        analyser.connect(this.destination);
        w.audioTest.analyser = analyser;
        const connect = AudioNode.prototype.connect;
        const destination = this.destination;
        AudioNode.prototype.connect = function (node: any, ...rest: any[]) {
          return (connect as any).call(
            this,
            node === destination && this !== analyser ? analyser : node,
            ...rest,
          );
        };
      }
    };
  });
}
async function start(page: Page) {
  await instrument(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start onboarding", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Open player", exact: true }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
}
test("six decoded recordings generate a real signal; individual mute changes the gain", async ({
  page,
}) => {
  await start(page);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const t = (window as any).audioTest;
        return t.sources.length;
      }),
    )
    .toBe(6);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const t = (window as any).audioTest;
        const data = new Float32Array(t.analyser.fftSize);
        t.analyser.getFloatTimeDomainData(data);
        return Math.max(...data.map(Math.abs));
      }),
    )
    .toBeGreaterThan(0.001);
  expect(
    await page.evaluate(() =>
      (window as any).audioTest.sources.every(
        (s: any) => s.buffer.duration > 47 && s.loop,
      ),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Mixer", exact: true }).click();
  await page.getByRole("switch", { name: "Rain", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).audioTest.gains[1].gain.value),
    )
    .toBeLessThan(0.001);
  await page.getByRole("switch", { name: "Rain", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).audioTest.gains[1].gain.value),
    )
    .toBeGreaterThan(0.69);
});
test("resume after a wall-clock timer expiry stays stopped", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "Timer", exact: true }).click();
  await page
    .getByRole("button", { name: "Custom duration", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Custom minutes", exact: true })
    .fill("1");
  await page.getByRole("button", { name: "Start timer", exact: true }).click();
  await page.clock.setSystemTime(new Date(Date.now() + 61000));
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Time remaining", { exact: true })).toHaveText(
    "—",
  );
});
test("actual audio-clock fade and timer finish", async ({ page }) => {
  test.setTimeout(90000);
  await start(page);
  await page.getByRole("button", { name: "Timer", exact: true }).click();
  await page
    .getByRole("button", { name: "Custom duration", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Custom minutes", exact: true })
    .fill("1");
  await page.getByRole("button", { name: "Start timer", exact: true }).click();
  await expect
    .poll(
      () => page.evaluate(() => (window as any).audioTest.gains[0].gain.value),
      { timeout: 50000, intervals: [1000] },
    )
    .toBeLessThan(0.35);
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const t = (window as any).audioTest;
        let d = new Float32Array(t.analyser.fftSize);
        t.analyser.getFloatTimeDomainData(d);
        return Math.max(...d.map(Math.abs));
      }),
    )
    .toBeLessThan(0.00001);
});
