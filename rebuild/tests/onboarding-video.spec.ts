import { test, expect } from "@playwright/test";
async function init(page: import('@playwright/test').Page, dark=true) {
  await page.addInitScript(dark => localStorage.setItem('sound-room.confirmed-design.v1', JSON.stringify({dark,en:true,onboarded:false})),dark);
  await page.goto('/?welcome=1');
  await page.getByRole('button',{name:'Start onboarding',exact:true}).click();
}
test('dark first onboarding plays the supplied video and pauses away from its page',async({page})=>{
  await init(page);
  const video=page.getByTestId('onboarding-mix-video');
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeGreaterThan(.2);
  expect(await video.evaluate(v=>{const m=v as HTMLVideoElement;return [m.muted,m.loop,m.playsInline,m.videoWidth,m.videoHeight]})).toEqual([true,true,true,464,832]);
  await expect(page.getByText('Mix the sounds of nature freely',{exact:true})).toBeVisible();
  await page.screenshot({path:'/tmp/sound-room-dark-onboarding-video.png'});
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole('button',{name:'Onboarding 1',exact:true}).click();
  await expect.poll(()=>video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(false);
});
test('light first onboarding retains its image',async({page})=>{
  await init(page,false);
  await expect(page.getByTestId('onboarding-mix-video')).toHaveCount(0);
  await expect(page.getByTestId('welcome-background-1').locator('image')).toHaveAttribute('href',/onboarding_mixing_room_light_corrected/);
});
test('reduced motion and failed movie preserve the first frame and navigation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await init(page);
  const video=page.getByTestId('onboarding-mix-video');
  expect(await video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await expect(page.locator('img[src*="onboarding-dark-mix-poster"]')).toBeVisible();
  await page.route('**/*onboarding-dark-mix*.mp4*',r=>r.abort());
  await page.reload();
  await page.getByRole('button',{name:'Start onboarding',exact:true}).click();
  await expect(video).toHaveCount(0);
  await expect.poll(()=>page.locator('img[src*="onboarding-dark-mix-poster"]').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(464);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.getByTestId('welcome-scene-2')).not.toHaveAttribute('aria-hidden','true');
});
