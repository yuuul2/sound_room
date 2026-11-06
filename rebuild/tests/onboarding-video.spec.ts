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
test('dark second onboarding uses its own movie and pauses on both adjacent pages',async({page})=>{
  await init(page);
  const first=page.getByTestId('onboarding-mix-video');
  const second=page.getByTestId('onboarding-rest-video');
  await expect.poll(()=>first.evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeGreaterThan(.2);
  expect(await second.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect.poll(()=>second.evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeGreaterThan(.2);
  expect(await second.evaluate(v=>{const m=v as HTMLVideoElement;return [m.muted,m.loop,m.playsInline,m.videoWidth,m.videoHeight]})).toEqual([true,true,true,448,880]);
  await expect.poll(()=>first.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect.poll(()=>second.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole('button',{name:'Onboarding 2',exact:true}).click();
  await expect.poll(()=>second.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(false);
  // Playback now starts before navigation finishes; wait for interactive controls.
  await expect(page.getByTestId('welcome-scene-2')).not.toHaveAttribute('aria-hidden','true');
  await page.getByRole('button',{name:'Onboarding 1',exact:true}).click();
  await expect.poll(()=>second.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
});
test('light second onboarding keeps its original image',async({page})=>{
  await init(page,false);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.getByTestId('onboarding-rest-video')).toHaveCount(0);
  await expect(page.getByTestId('welcome-background-2').locator('image')).toHaveAttribute('href',/onboarding_arch_room/);
});
test('dark second movie keeps a poster for reduced motion or loading errors',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await init(page);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  const video=page.getByTestId('onboarding-rest-video');
  expect(await video.evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
  await page.route('**/*onboarding-dark-rest*.mp4*',r=>r.abort());
  await page.reload();
  await page.getByRole('button',{name:'Start onboarding',exact:true}).click();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(video).toHaveCount(0);
  await expect.poll(()=>page.locator('img[src*="onboarding-dark-rest-poster"]').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(448);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.getByRole('button',{name:'Get started',exact:true})).toBeVisible();
});
test('second movie starts during the incoming fade and recovers from a rejected first play',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLMediaElement.prototype.play;
    const samples: { opacity:string; hidden:string|null }[]=[];
    (window as any).restPlaySamples=samples;
    HTMLMediaElement.prototype.play=function(){
      if(this.getAttribute('data-testid')==='onboarding-rest-video'){
        samples.push({opacity:getComputedStyle(this).opacity,hidden:document.querySelector('[data-testid="welcome-scene-2"]')?.getAttribute('aria-hidden')??null});
        if(samples.length===1)return Promise.reject(new DOMException('Transient startup interruption','AbortError'));
      }
      return original.call(this);
    };
  });
  await init(page);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  const movie=page.getByTestId('onboarding-rest-video');
  await expect.poll(()=>movie.evaluate(v=>(v as HTMLVideoElement).currentTime)).toBeGreaterThan(.2);
  const samples=await page.evaluate(()=>(window as any).restPlaySamples);
  expect(samples.length).toBeGreaterThanOrEqual(2);
  expect(samples[0]).toEqual({opacity:'1',hidden:'true'});
});
test('second movie waits for delayed data without losing playback or hiding its poster',async({page})=>{
  await page.route('**/*onboarding-dark-rest*.mp4*',async route=>{
    const response=await route.fetch();
    await new Promise(resolve=>setTimeout(resolve,1800));
    await route.fulfill({response});
  });
  await init(page);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  const movie=page.getByTestId('onboarding-rest-video');
  await expect(movie).toHaveCSS('opacity','1');
  await expect(page.locator('img[src*="onboarding-dark-rest-poster"]')).toBeVisible();
  await expect.poll(()=>movie.evaluate(v=>(v as HTMLVideoElement).currentTime),{timeout:12000}).toBeGreaterThan(.2);
});
test('pending startup retries do not restart a movie after leaving its page',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLMediaElement.prototype.play;
    (window as any).restAttempts=0;
    HTMLMediaElement.prototype.play=function(){
      if(this.getAttribute('data-testid')==='onboarding-rest-video'){
        (window as any).restAttempts++;
        return Promise.reject(new DOMException('Temporarily unavailable','AbortError'));
      }
      return original.call(this);
    };
  });
  await init(page);
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.getByTestId('welcome-scene-2')).not.toHaveAttribute('aria-hidden','true');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.getByTestId('welcome-scene-3')).not.toHaveAttribute('aria-hidden','true');
  const attempts=await page.evaluate(()=>(window as any).restAttempts);
  expect(attempts).toBeGreaterThan(0);
  await page.waitForTimeout(1100);
  expect(await page.evaluate(()=>(window as any).restAttempts)).toBe(attempts);
  expect(await page.getByTestId('onboarding-rest-video').evaluate(v=>(v as HTMLVideoElement).paused)).toBe(true);
});
