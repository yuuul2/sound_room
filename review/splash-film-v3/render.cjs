// Video compositing only: rigid layers, fixed camera, no mesh/displacement distortion.
// Inpainted plate is used ONLY under the boat, never as a replacement background.
const {chromium}=require('@playwright/test');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),{once}=require('events');
(async()=>{
 const out=__dirname; const files=['../../rebuild/assets/light/backgrounds_covers/splash.png','../splash-film-v2/boat-clean-plate.png'].map(f=>fs.readFileSync(path.resolve(out,f)).toString('base64'));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage();
 await page.setContent('<canvas width="720" height="1440"></canvas>');
 await page.evaluate(async files=>{
 const W=720,H=1440,c=document.querySelector('canvas').getContext('2d');
 const surface=()=>{const x=document.createElement('canvas');x.width=W;x.height=H;return x};
 const load=async data=>{const i=new Image();i.src='data:image/png;base64,'+data;await i.decode();const s=surface(),x=s.getContext('2d');x.filter='saturate(.86)';x.drawImage(i,0,0,W,H);return s};
 const [base,repair]=await Promise.all(files.map(load));
 const ellipse=(source,x,y,rx,ry,feather=.25)=>{const s=surface(),a=s.getContext('2d');a.save();a.translate(x*W,y*H);a.scale(rx*W,ry*H);const g=a.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'white');g.addColorStop(1-feather,'white');g.addColorStop(1,'transparent');a.fillStyle=g;a.fillRect(-1,-1,2,2);a.restore();a.globalCompositeOperation='source-in';a.drawImage(source,0,0);return s};
 const plate=surface(),pc=plate.getContext('2d');pc.drawImage(base,0,0);pc.drawImage(ellipse(repair,.262,.661,.092,.060,.3),0,0);
 const boat=surface(),bc=boat.getContext('2d');bc.scale(W/887,H/1774);bc.beginPath();[[231,1126],[235,1142],[254,1187],[255,1197],[273,1198],[260,1212],[198,1213],[191,1200],[203,1197],[222,1150]].forEach(([x,y],i)=>i?bc.lineTo(x,y):bc.moveTo(x,y));bc.closePath();bc.clip();bc.drawImage(base,0,0,887,1774);
 const boatGlints=[ellipse(base,.226,.664,.025,.012,.65),ellipse(base,.293,.664,.025,.012,.65)];
 const clouds=[
 [ellipse(base,.055,.045,.36,.19,.32),5,1.1,0],
 [ellipse(base,1.04,.25,.25,.30,.32),-4,1.7,1.1],
 [ellipse(base,-.025,.46,.27,.18,.4),4,1,2.4],
 [ellipse(base,.02,.96,.33,.23,.3),6,-1.5,.7],
 [ellipse(base,.98,.96,.27,.21,.3),-5,1.5,2.1]
 ];
 const water=surface(),wc=water.getContext('2d');wc.beginPath();[[.01,.658],[.94,.664],[.94,.74],[.82,.81],[.66,.91],[.38,.91],[.19,.80],[.015,.75]].forEach(([x,y],i)=>i?wc.lineTo(x*W,y*H):wc.moveTo(x*W,y*H));wc.closePath();wc.fillStyle='white';wc.filter='blur(12px)';wc.fill();wc.filter='none';wc.globalCompositeOperation='source-in';wc.drawImage(plate,0,0);
 const glow=(x,y,rx,ry,a)=>{if(a<=0)return;c.save();c.translate(x*W,y*H);c.scale(rx*W,ry*H);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(255,247,230,${a})`);g.addColorStop(.18,`rgba(255,238,221,${a*.65})`);g.addColorStop(1,'rgba(255,238,221,0)');c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore()};
 const stars=[[.65,.084],[.465,.133],[.423,.177],[.217,.204],[.425,.246],[.071,.275],[.322,.291],[.66,.336],[.265,.345],[.39,.365],[.575,.374]];
 const pix=base.getContext('2d').getImageData(0,0,W,H).data,glints=[];
 for(let y=950;y<1300;y+=5)for(let x=280;x<465;x+=7){let i=(y*W+x)*4;if(pix[i]>200&&pix[i+1]>165&&Math.abs(x/W-.52)<.085)glints.push([x/W,y/H]);}
 window.renderFrame=(t,motion)=>{
 const phase=t/8*Math.PI*2;c.globalCompositeOperation='source-over';c.drawImage(motion?plate:base,0,0);
 if(motion){
 // Each layer translates as a whole; no stretching of the artwork.
 c.drawImage(water,5.8*Math.sin(phase),1.5*Math.sin(phase*2));
 for(const [layer,dx,dy,offset]of clouds)c.drawImage(layer,1.8*dx*(Math.sin(phase+offset)-Math.sin(offset)),1.6*dy*(Math.cos(phase+offset)-Math.cos(offset)));
 c.save();const x=.262*W,y=.679*H;c.translate(x+6*Math.sin(phase),y+2*Math.sin(phase*2));c.rotate(.025*Math.sin(phase*2+.3));c.drawImage(boat,-x,-y);c.restore();
 for(const star of boatGlints)c.drawImage(star,0,0);
 }
 c.globalCompositeOperation='screen';
 stars.forEach(([x,y],i)=>{
 const pulse=Math.pow(.5+.5*Math.sin(phase*(2+i%3)+i*2.399),8);
 const secondary=Math.pow(.5+.5*Math.sin(phase*(5+i%2)+i*1.71),12)*.24;
 const a=Math.min(1,.02+.94*pulse+secondary);
 glow(x,y,.020,.010,a*.82);glow(x,y,.004,.002,a);
 // Fine cross rays follow the original star, avoiding large glowing blobs.
 glow(x,y,.019,.001,a*.58);glow(x,y,.0018,.010,a*.46);
 });
 const breath=Math.pow(.5+.5*Math.sin(phase-Math.PI/2),1.4);
 const flicker=.5+.5*Math.sin(phase*3+.6);
 glow(.592,.252,.105,.060,.21*breath+.035*flicker);
 glow(.548,.291,.080,.033,.16*breath);
 // Small moving highlights along existing bright reflection flecks.
 glints.forEach(([x,y],i)=>{
 const pulse=Math.pow(.5+.5*Math.sin(phase*(3+i%2)-y*95+i*.43),10);
 const drift=motion?.0025*Math.sin(phase*2+y*30):0;
 glow(x+drift,y,.006+(i%3)*.002,.0008,.98*pulse);
 });
 c.globalCompositeOperation='source-over';return c.canvas.toDataURL('image/jpeg',.96).split(',')[1];
 };
 // Same phase at 0/8 seconds must have identical compositing.
 window.loopCheck=()=>window.renderFrame(0,true)===window.renderFrame(8,true);
 },files);
 console.log('Seamless phase check:',await page.evaluate(()=>window.loopCheck()));
 for(const motion of [false,true]){
 const name=motion?'splash-motion-v3.mp4':'splash-lights-v3.mp4';
 const enc=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate','24','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,name)]);enc.stderr.pipe(process.stderr);const done=once(enc,'close');
 for(let n=0;n<192;n++){const data=await page.evaluate(([t,m])=>window.renderFrame(t,m),[n/24,motion]);if(!enc.stdin.write(Buffer.from(data,'base64')))await once(enc.stdin,'drain');if(n%96===0)console.log(name,n+'/192');}
 enc.stdin.end();const[code]=await done;if(code)throw Error('ffmpeg '+code);
 }
 // Review frames use the same compositor as the MP4; source PNGs are never overwritten.
 for(const t of [0,2,4,6]){const data=await page.evaluate(t=>window.renderFrame(t,true),t);fs.writeFileSync('/tmp/splash-v3-'+t+'.jpg',Buffer.from(data,'base64'))}
 await browser.close();console.log('Both films ready');
})().catch(e=>{console.error(e);process.exit(1)});
