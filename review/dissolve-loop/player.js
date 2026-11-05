const videos=[...document.querySelectorAll('video')];
const play=document.querySelector('#play'), status=document.querySelector('#status');
const phone=document.querySelector('.phone'),theme=document.querySelector('#theme');
const IN=2, TURN=8, FADE=1.4;
let active=0, running=false, ready=false, transition=null, preparing=false, resume=false;
window.dissolveStats={transitions:0,ended:0};
for(const v of videos){v.muted=true;v.loop=false;v.addEventListener('ended',()=>window.dissolveStats.ended++);}
function seek(v,time){return new Promise(resolve=>{if(Math.abs(v.currentTime-time)<.01&&v.readyState>=2)return resolve();v.addEventListener('seeked',resolve,{once:true});v.currentTime=time;});}
function sync(){play.textContent=running?'일시정지':'재생';}
async function start(){if(!ready)return;try{await videos[active].play();if(transition)await videos[1-active].play();running=true;status.textContent='';}catch{status.textContent='재생 버튼을 눌러 주세요.';}sync();}
function pause(){running=false;videos.forEach(v=>v.pause());sync();}
play.onclick=()=>running?pause():start();
async function begin(){preparing=true;const next=videos[1-active];try{await next.play();if(!running){next.pause();return;}next.style.zIndex=2;videos[active].style.zIndex=1;transition={start:videos[active].currentTime};}catch{status.textContent='재생 버튼을 눌러 주세요.';pause();}finally{preparing=false;}}
function tick(){
 if(running){const current=videos[active],next=videos[1-active];
  if(!transition&&!preparing&&current.currentTime>=TURN)begin();
  if(transition){const p=Math.min(1,Math.max(0,(current.currentTime-transition.start)/FADE));
   // Keep the lower video opaque: prevents a dark flash during the dissolve.
   next.style.opacity=p;
   if(p>=1){current.pause();current.style.opacity=0;next.style.opacity=1;active=1-active;transition=null;window.dissolveStats.transitions++;seek(current,IN);}
  }
 }
 requestAnimationFrame(tick);
}
theme.onclick=()=>{phone.classList.toggle('dark');theme.textContent=phone.classList.contains('dark')?'라이트로 보기':'다크로 보기';};
try{if(JSON.parse(localStorage.getItem('sound-room.confirmed-design.v1')||'{}').dark)theme.click();}catch{}
document.addEventListener('visibilitychange',()=>{if(document.hidden){resume=running;pause();}else if(resume){resume=false;start();}});
(async()=>{try{
 await Promise.all(videos.map(async(v,i)=>{
  // Fully buffered local blobs allow hidden seeks without a network range request.
  const response=await fetch(i?'reverse.mp4':'forward.mp4');if(!response.ok)throw Error('video');
  const metadata=new Promise((resolve,reject)=>{v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',reject,{once:true});});
  v.src=URL.createObjectURL(await response.blob());await metadata;await seek(v,IN);
 }));videos[0].style.opacity=1;ready=true;await start();requestAnimationFrame(tick);
}catch{status.textContent='영상을 불러오지 못했습니다. 페이지를 새로고침해 주세요.';play.textContent='불러오기 실패';}})();
