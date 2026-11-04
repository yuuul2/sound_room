// Deterministic 10-second light-compositing film. Original artwork never warped.
const {chromium}=require('@playwright/test');
const fs=require('fs'); const {spawn}=require('child_process'); const {once}=require('events');const path=require('path');
(async()=>{const out=__dirname;const png=fs.readFileSync(path.resolve(out,'../../rebuild/assets/light/backgrounds_covers/splash.png')).toString('base64');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage();
await page.setContent('<canvas width="720" height="1440"></canvas>');
await page.evaluate(async png=>{const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();const canvas=document.querySelector('canvas'),c=canvas.getContext('2d');const base=document.createElement('canvas');base.width=720;base.height=1440;const b=base.getContext('2d');b.filter='saturate(.86)';b.drawImage(img,0,0,720,1440);const original=b.getImageData(0,0,720,1440).data;
const glow=(x,y,rx,ry,a)=>{c.save();c.translate(x*720,y*1440);c.scale(rx*720,ry*1440);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(255,244,220,${a})`);g.addColorStop(.27,`rgba(255,235,215,${a*.55})`);g.addColorStop(1,'rgba(255,235,215,0)');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore()};
const stars=[[.65,.084],[.465,.133],[.423,.177],[.217,.204],[.425,.246],[.071,.275],[.322,.291],[.66,.336],[.265,.345],[.39,.365],[.575,.374]];
// Select original bright reflection pixels; no added stars or moved source pixels.
const glints=[];for(let y=950;y<1300;y+=7)for(let x=270;x<470;x+=9){let i=(y*720+x)*4;if(original[i]>.77*255&&original[i+1]>.65*255&&Math.abs(x/720-.52)<.075)glints.push([x/720,y/1440]);}
window.renderFrame=(t)=>{c.globalCompositeOperation='source-over';c.drawImage(base,0,0);c.globalCompositeOperation='screen';const phase=t/10*Math.PI*2;
stars.forEach(([x,y],i)=>{const v=Math.pow((1+Math.sin(phase*(i%2+2)+i*2.399))/2,5);glow(x,y,.024,.012,.66*v);glow(x,y,.0045,.00225,.7*v)});
const breath=(1+Math.sin(phase-Math.PI/2))/2;glow(.59,.25,.12,.069,.25*breath);glow(.555,.291,.10,.047,.16*breath);
glints.forEach(([x,y],i)=>{const v=Math.pow((1+Math.sin(phase*2-y*85+i*.37))/2,7);glow(x,y,.010+i%3*.003,.00085,.65*v)});
c.globalCompositeOperation='source-over';return canvas.toDataURL('image/jpeg',.96).split(',')[1]};},png);
const enc=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'splash-light-v1.mp4')]);enc.stderr.pipe(process.stderr);const done=once(enc,'close');
for(let n=0;n<240;n++){const data=await page.evaluate(t=>window.renderFrame(t),n/24);if(!enc.stdin.write(Buffer.from(data,'base64')))await once(enc.stdin,'drain');if(n%60===0)console.log('Rendered '+n+'/240');}enc.stdin.end();const [code]=await done;await browser.close();if(code)throw Error('ffmpeg '+code);console.log('MP4 ready');})();
