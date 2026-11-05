figma.showUI(__html__, {width:480,height:360});
let busy=false;
function rgba(hex){const s=hex.replace('#','');return {r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4,6),16)/255,a:s.length===8?parseInt(s.slice(6,8),16)/255:1};}
/** @returns {Paint[]} */
function paint(value, diagonal=false){if(Array.isArray(value))return [{type:'GRADIENT_LINEAR',gradientTransform:diagonal?[[.5,.5,0],[-.5,.5,.5]]:[[0,1,0],[-1,0,1]],gradientStops:value.map((c,i)=>({position:i/(value.length-1),color:rgba(c)}))}];const c=rgba(value);return [{type:'SOLID',color:{r:c.r,g:c.g,b:c.b},opacity:c.a}];}
figma.ui.onmessage=async message=>{
 if(message.type!=='import'||busy)return;busy=true;let page;
 try{
  const p=message.project;
  if(!Array.isArray(p.screens)||p.screens.length!==13)throw Error('모드별 13개 화면 패키지를 선택해 주세요.');
  const fonts=await figma.listAvailableFontsAsync();
  for(const style of ['Regular','SemiBold']){
   if(!fonts.some(f=>f.fontName.family==='Pretendard'&&f.fontName.style===style))throw Error('Pretendard '+style+' 폰트를 설치한 뒤 Figma 데스크톱을 다시 열어 주세요. 다른 서체로 대체하지 않습니다.');
   await figma.loadFontAsync({family:'Pretendard',style});
  }
  const hashes={};
  for(const [id,asset] of Object.entries(p.assets)){
   const bytes=message.assets[id];if(!bytes)throw Error('원본 에셋 누락: '+id);
   hashes[id]=figma.createImage(figma.base64Decode(bytes)).hash;
  }
  page=figma.createPage();page.name='SOUND ROOM · '+p.screens[0].theme+' · 검토 '+new Date().toISOString().slice(0,16).replace('T',' ');
  await figma.setCurrentPageAsync(page);
  const pending=[],screens={};
  function make(spec,parent){let n;
   if(spec.type==='text'){
    n=figma.createText();n.fontName={family:'Pretendard',style:spec.weight||'Regular'};n.characters=spec.text;n.fontSize=spec.fontSize;n.lineHeight={unit:'PIXELS',value:spec.fontSize*1.35};n.textAlignHorizontal=(spec.align||'left').toUpperCase();n.textAutoResize='NONE';n.fills=paint(spec.color);
   }else if(spec.type==='group'){n=figma.createFrame();n.fills=[];n.clipsContent=!!spec.clip;}
   else {n=figma.createRectangle();n.cornerRadius=spec.radius||0;
    if(spec.type==='image')n.fills=[{type:'IMAGE',imageHash:hashes[spec.asset],scaleMode:spec.fit||'FILL',filters:{saturation:(spec.saturation??1)-1}}];
    else n.fills=paint(spec.fill,spec.direction==='diagonal');
   }
   parent.appendChild(n);n.name=spec.name;n.resize(spec.w,spec.h);n.x=spec.x;n.y=spec.y;
   if(spec.rotation===180){n.rotation=180;n.x+=spec.w;n.y+=spec.h;}
   if(spec.stroke)n.strokes=paint(spec.stroke);
   if(spec.blend)n.blendMode=spec.blend;
   if(spec.asset)n.setPluginData('original-asset',p.assets[spec.asset].path);
   if(spec.target)pending.push([n,spec.target]);
   if(spec.scroll&&n.type==='FRAME')n.overflowDirection=spec.scroll==='HORIZONTAL'?'HORIZONTAL':'VERTICAL';
   for(const child of spec.children||[])make(child,n);
   return n;
  }
  for(let i=0;i<p.screens.length;i++){
   const s=p.screens[i],f=figma.createFrame();page.appendChild(f);f.name=s.id+' · '+s.name;f.resize(390,844);f.x=(i%5)*470;f.y=Math.floor(i/5)*944;f.clipsContent=true;f.fills=paint(s.theme==='dark'?'#302a3c':'#eee6ff');screens[s.id]=f;
   f.setPluginData('review-status','Prepared from supplied references; Figma rendering requires final comparison.');
   for(const c of s.children)make(c,f);
  }
  for(const [n,target] of pending)if(screens[target]&&n.setReactionsAsync)await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:screens[target].id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',duration:.3,easing:{type:'EASE_IN_AND_OUT'}},preserveScrollPosition:false}]}]);
  figma.currentPage.selection=Object.values(screens);figma.viewport.scrollAndZoomIntoView(Object.values(screens));
  figma.ui.postMessage({type:'done',text:'13개 화면을 새 페이지에 추가했습니다. 텍스트·도형·원본 이미지가 분리되어 있습니다. 실제 렌더링과 시안 비교를 진행해 주세요.'});
 }catch(e){if(page)page.name+=' · 미완료';figma.ui.postMessage({type:'error',text:String(e.message||e)});}finally{busy=false;}
};
