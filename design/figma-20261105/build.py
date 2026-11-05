"""Editable screen specification, based on final boards plus explicit later revisions.
No writes to app source or original assets. Figma rendering remains a separate check.
"""
from pathlib import Path
import json, re, hashlib
ROOT=Path(__file__).resolve().parents[2]; OUT=Path(__file__).resolve().parent
names=['달빛 아래의 비','포근한 카페의 밤','안개 낀 숲속','잔잔한 바다의 꿈']
covers=['preset_rain_bedroom','preset_cafe','preset_forest','preset_ocean']
sounds=['rain','ocean','wind','cafe','forest','piano']; labels=['비','바다','바람','카페','숲','피아노']; volumes=[70,50,30,40,60,45]
subs=['비 · 피아노','카페 · 비','숲 · 바람','바다 · 피아노']
descs=['차분히 내리는 빗소리','잔잔한 파도 소리','부드럽게 스치는 바람','따뜻한 카페의 생활음','맑은 숲속의 자연 소리','감성적인 피아노 선율']
keys=['01-splash','02-onboarding-mix','03-onboarding-rest','04-onboarding-save','05-home','06-explore','07-detail','08-mixer','09-player','10-timer','11-save','12-library','13-my']
titles=['시작','온보딩 · 믹싱','온보딩 · 휴식','온보딩 · 저장','홈','분위기 탐색','분위기 상세','사운드 믹서','플레이어','타이머 시트','저장 시트','나의 라이브러리','마이']
assets={}; allscreens=[]
def node(kind,name,x,y,w,h,**kw):return dict(type=kind,name=name,x=x,y=y,w=w,h=h,**kw)
def rect(name,x,y,w,h,fill,rad=0,**kw):return node('rect',name,x,y,w,h,fill=fill,radius=rad,direction='diagonal' if isinstance(fill,list) and fill==C['gradient'] else 'vertical',**kw)
def text(value,x,y,w,h,size=14,color=None,align='left',weight='Regular',**kw):return node('text',value.replace('\n',' / '),x,y,w,h,text=value,fontSize=size,color=color or C['text'],align=align,weight=weight,**kw)
def group(name,x,y,w,h,children,**kw):return node('group',name,x,y,w,h,children=children,**kw)
def image(key,x,y,w,h,fit='FILL',radius=0,theme=None,**kw):
 theme=theme or mode; assetid=theme+'/'+key
 if assetid not in assets:
  p=ROOT/'rebuild/assets'/theme/(key+'.png')
  if key=='backgrounds_covers/onboarding_mixing_room':p=ROOT/'rebuild/assets/revisions/20261104'/('onboarding_mixing_room_corrected.png' if theme=='dark' else 'onboarding_mixing_room_light_corrected.png')
  if key=='video-poster':p=ROOT/'rebuild/video/splash-star-flow-poster.jpg'
  assert p.exists(),p
  assets[assetid]={'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 return node('image',key,x,y,w,h,asset=assetid,fit=fit,radius=radius,**kw)
def icon(key,x,y,size=24,**kw):return image('ui_icons/'+key,x,y,size,size,'FIT',**kw)
def glass(name,x,y,w,h,children=None,rad=22,**kw):return group(name,x,y,w,h,[rect('Glass surface',0,0,w,h,C['glass'],rad,stroke=C['stroke'])]+(children or []),**kw)
def button(label,y,target=None,iconkey=None,secondary=False):
 ch=[rect('Button surface',0,0,350,54,C['glass'] if secondary else C['gradient'],27,stroke=C['stroke']),text(label,35,16,280,26,17,C['text'] if secondary else '#ffffff','center')]
 if iconkey:ch.append(icon(iconkey,26,16,22,theme='dark' if not secondary else mode))
 return group(label,20,y,350,54,ch,target=target,component='Button')
def nav(selected):
 ch=[rect('Rounded navigation surface',0,0,366,68,C['nav'],26)]
 for i,(key,label,target) in enumerate([('home','홈','05-home'),('mixer','믹서','08-mixer'),('play','','09-player'),('bookmark','보관함','12-library'),('user','마이','13-my')]):
  x=7+i*72
  a=[]
  if i==2:a=[rect('Central circular play',7,4,56,56,C['gradient'],28),icon(key,23,20,24,theme='dark')]
  else:a=[icon(key,21,9,26),text(label,1,42,66,18,11,C['text'] if target==selected else C['muted'],'center')]
  ch.append(group(label or '재생',x,0,70,68,a,target=target))
 return group('하단 메뉴 · 고정',12,764,366,68,ch,component='Navigation')
def header(label,back='05-home',right=None):
 ch=[group('뒤로',10,40,44,44,[icon('back',10,10)],target=back),text(label,60,50,270,28,19,C['text'],'center')]
 if right:ch.append(icon(right,343,50,24))
 return ch

def status(white=False):
 col='#ffffff' if white else C['text']
 return [text('9:41',24,14,60,20,12,col),rect('Status / battery',340,18,23,10,col,2),rect('Status / battery cap',364,21,2,4,col,1)]+[rect('Status / signal',302+i*5,25-i*2,3,3+i*2,col,1) for i in range(4)]
def background(key='home_clouds',darken=False):
 a=[image('backgrounds_covers/'+key,0,0,390,844)]
 if darken:a.append(rect('Readability overlay',0,0,390,844,['#24203300','#37304499']))
 return a

def tags(vals,x,y,w=350):
 gap=6;cw=(w-gap*(len(vals)-1))/len(vals)
 return [glass(v,x+i*(cw+gap),y,cw,28,[text(v,0,5,cw,18,12,C['muted'],'center')],rad=14) for i,v in enumerate(vals)]
def smallcards(y):
 ch=[]
 for i in range(4):
  x=i*97
  ch.extend([image('backgrounds_covers/'+covers[i],x,0,90,92,radius=16),group('재생 '+names[i],x+53,54,36,36,[rect('Glass play',0,0,32,32,'#ffffff66',16,stroke='#ffffff88'),icon('play',8,8,16,theme='dark')],target='09-player'),text(names[i],x,97,90,18,11),text(subs[i],x,116,90,16,10,C['muted'])])
 return group('분위기 프리셋 · 가로 스크롤',20,y,370,136,ch,clip=True,scroll='HORIZONTAL')
def mixer():
 ch=background('mixer_cloud_gradient')+[rect('Mixer background readability',0,0,390,844,C['mixerWash'])]+status()+header('나만의 사운드 믹서')
 ch += [icon('reset',305,51,17),text('초기화',327,51,48,20,12,C['muted'])]
 ch += [glass('상단 배너',20,88,350,94,[image('backgrounds_covers/mixer_cloud_gradient',0,0,350,94,radius=22),text('지금, 어떤 소리로\n당신의 공간을 채우고 싶나요?',20,16,310,44,16,weight='SemiBold'),text('여러 소리를 섞어, 나만의 분위기를 만들어보세요.',20,65,315,18,11,C['muted'])])]
 ch += [glass('사운드 검색',20,190,350,40,[icon('search',14,9,22),text('사운드 검색하기',50,11,270,20,13,C['muted'])],rad=20)]
 for i,(sound,label,v) in enumerate(zip(sounds,labels,volumes)):
  y=238+i*70
  row=[image('sound_mixer/'+sound,0,1,62,62,'FIT'),text(label,78,3,150,22,16,weight='SemiBold'),text(descs[i],78,27,224,18,12,C['muted']),rect('Volume track',78,53,176,6,C['track'],3),rect('Volume active',78,53,176*v/100,6,C['accent'],3),rect('Volume thumb',70+176*v/100,47,18,18,'#ffffff',9),text(str(v)+'%',272,47,56,18,12,C['muted'],'right'),rect('Sound ON',293,4,38,22,C['accent'],11),rect('Toggle thumb',310,6,18,18,'#ffffff',9)]
  ch.append(group('사운드 · '+label,20,y,350,68,row,component='Sound card'))
 ch += [text('추천 밸런스',20,665,350,24,16,weight='SemiBold')]
 ch += [smallcards(694)]
 # Recommendation thumbnails fit above the CTA; retain all 4 in clipped horizontal frame.
 ch[-1]['h']=68
 for n in ch[-1]['children']:
  if n['type']=='image':n['h']=50
  elif n['type']=='text':n['y']=53 if n['y']==97 else 72;n['fontSize']=10
  elif n['type']=='group':n['y']=20;n['x']+=8;n['w']=28;n['h']=28
 ch.append(button('이 분위기로 재생하기',774,'09-player','play'))
 return ch

def player():
 ch=background('player_moon_ocean')+[rect('Player lower readability',0,390,390,454,['#302a3b00','#302a3bee'] if mode=='dark' else ['#8c88ce00','#7779b9e8'])]+status(True)
 ch[0]['y']=-80
 ch += [icon('down',20,52,24,theme='dark'),text('지금 흐르는 분위기',70,52,250,24,17,'#ffffff','center'),icon('more',346,52,24,theme='dark')]
 ch += [text(names[0],20,372,350,34,24,'#ffffff','center'),text('비와 피아노가 그리는\n조용하고 따뜻한 밤',20,413,350,46,14,'#eee8fc','center'),icon('heart',182,467,26,theme='dark')]
 ch += [image('player/waveform',28,510,334,58,'FIT')]
 for i,(sound,label) in enumerate(zip(sounds,labels)):
  ch += [image('player/'+sound,21+i*59,583,46,46,'FIT'),text(label,16+i*59,632,56,16,10,'#ffffff','center')]
 ch += [rect('Timeline track',24,662,342,3,'#ffffff44',2),rect('Timeline progress',24,662,112,3,'#d9b2dc',2),rect('Timeline thumb',131,657,12,12,'#e6bcdc',6),text('00:15:32',24,674,100,18,10,'#ddd4ec'),text('01:00:00',270,674,96,18,10,'#ddd4ec','right')]
 for i,key in enumerate(['shuffle','previous','pause','next','repeat']):
  x=[22,89,159,258,329][i]
  if key=='pause':ch += [rect('Main playback control',159,697,72,72,'#ffffff30',36,stroke='#ffffffaa'),icon(key,181,719,28,theme='dark')]
  else:ch.append(icon(key,x,720,28,theme='dark'))
 for i,(key,label,target) in enumerate([('timer','타이머','10-timer'),('infinity','하루종일',None),('bookmark','저장','11-save'),('heart','좋아요',None)]):
  ch.append(glass(label,13+i*94,781,82,53,[icon(key,30,6,23,theme='dark'),text(label,0,32,82,16,10,'#ffffff','center')],rad=14,target=target))
 return ch

def build(mode_):
 global mode,C
 mode=mode_; dark=mode=='dark'
 C=dict(text='#eee8fc' if dark else '#282781',muted='#c7bbd7' if dark else '#8581c5',glass='#5d536b88' if dark else '#ffffff88',stroke='#dcd0ec55' if dark else '#ffffffbb',nav='#4d425edd' if dark else '#f7f3ffdd',accent='#c9a4d2' if dark else '#9182e7',track='#aaa0bb55',gradient=['#aab8ed','#a18ad1','#e4b8d5'] if dark else ['#809ff1','#9b89dc','#ecc4df'],mixerWash=['#302a3bdd','#302a3bf5'] if dark else ['#f4efffcc','#fcf9ffee'])
 screens=[]
 for key,title in zip(keys,titles):
  if key=='01-splash':
   ch=[image('video-poster',0,0,390,844),rect('Video tone overlay',0,0,390,844,['#2b263f66','#39314633','#3a344c99'] if dark else ['#e7e4f6a6','#aebff08c','#bfb4e4bf'],blend='NORMAL' if dark else 'SCREEN')]+status(True)+[text('Sound Room',20,334,350,66,47,'#ffffff','center',weight='Regular'),text('소리로 만드는 나만의 작은 꿈속 공간',20,410,350,24,14,'#ffffff','center')]
  elif key.startswith(('02-','03-','04-')):
   i=int(key[:2])-2
   ch=background(['onboarding_mixing_room','onboarding_arch_room','home_clouds'][i])+status(True)
   ch += [rect('Onboarding readability',0,0,390,260,['#39314644','#39314600'] if dark else ['#e3dffa88','#e3dffa00']),text('건너뛰기',290,57,80,22,15,target='05-home')]
   ch += [text(['자연의 소리를\n자유롭게 섞어보세요','지금, 나만의 공간에서\n잠시 쉬어가세요','좋아하는 분위기를\n다시 꺼내 들어보세요'][i],20,102,350,68,25,align='center',weight='SemiBold'),text(['비, 파도, 숲과 바람을 조합해\n나만의 분위기를 만들어요','소리와 달빛이 흐르는 공간에서\n하루의 속도를 천천히 낮춰보세요','이름을 붙여 저장하면 언제든\n나만의 공간으로 돌아올 수 있어요'][i],20,186,350,52,16,C['muted'],'center')]
   if i==0:ch.append(image('onboarding/onboarding',26,310,338,325,'FIT'))
   if i==2:
    cards=[]
    for j in range(4):
     cards.append(group(names[j],0,j*86,318,80,[image('backgrounds_covers/'+covers[j],0,0,318,80,radius=14),rect('Card contrast',0,0,318,80,['#16132400','#16132499'],14),text(names[j],14,24,220,24,14,'#ffffff',weight='SemiBold'),text(subs[j],14,50,210,18,12,'#ffffff'),icon('play',251,30,24,theme='dark'),icon('more',288,31,20,theme='dark')],target='07-detail'))
    ch.append(glass('내가 저장한 분위기 · 고정 박스',20,292,350,392,[text('내가 저장한 분위기',16,15,270,24,15,weight='SemiBold'),icon('pause',306,15,22),group('자동 이동 배너 · 내부 클리핑',16,48,318,328,cards,clip=True,scroll='VERTICAL')]))
   ch += [rect('Page indicator',166+j*24,733,9,9,C['accent'] if j==i else '#ffffff66',5,stroke='#ffffff' if j==i else None) for j in range(3)]
   ch.append(button('시작하기' if i==2 else '다음',770,'05-home' if i==2 else keys[i+2]))
  elif key=='05-home':
   ch=background()+[rect('Home lower lavender',0,480,390,364,['#eee6ff00','#eee6ffdd'] if not dark else ['#38304200','#383042cc'])]+status(True)
   ch += [text('SOUND ROOM',24,54,220,20,13,'#ffffff'),icon('search',294,52,24,theme='dark',target='06-explore'),image('backgrounds_covers/profile_crescent',340,48,30,30,'FILL',15,target='13-my')]
   ch += [text('좋은 밤이에요',24,133,270,34,26,'#ffffff'),icon('moon',201,136,26,theme='dark'),text('오늘은 어떤 분위기에 머물고 싶나요?',24,177,305,24,14,'#eee8fc'),glass('테마 전환',338,112,32,88,[icon('sun',4,10,24,theme='dark'),icon('moon',4,52,24,theme='dark')],rad=16)]
   ch += [group('오늘의 추천',20,304,350,230,[image('backgrounds_covers/preset_rain_bedroom',0,0,350,230,radius=24),rect('Hero readability',0,0,350,230,['#1f1c3300','#1f1c33dd'],24),text('오늘의 추천',20,117,230,18,12,'#eee8fc'),text(names[0],20,143,260,25,19,'#ffffff',weight='SemiBold'),text('조용히 내리는 비와\n부드러운 피아노가 만드는\n평온한 밤',20,176,240,50,12,'#ffffff'),rect('Hero play',286,173,46,46,'#ffffff88',23),icon('play',299,186,22,theme='dark')],target='09-player')]
   ch += tags(['전체','비','카페','숲','바다','바람','피아노'],20,548)
   ch += [text('분위기 프리셋',20,593,240,24,18,weight='SemiBold'),text('전체보기',288,595,80,22,12,C['muted'],'right',target='06-explore'),smallcards(626),nav(key)]
  elif key=='08-mixer':ch=mixer()
  elif key=='09-player':ch=player()
  elif key=='06-explore':
   ch=background()+status(True)+header('분위기 탐색')
   ch += [glass('분위기 검색',20,92,350,44,[icon('search',14,10,24),text('어떤 분위기를 찾고 있나요?',54,12,280,22,14,C['muted'])])]+tags(['전체','수면','집중','휴식','감성'],20,148)
   cards=[]
   for i in range(4):
    children=[image('backgrounds_covers/'+covers[i],0,0,350,160,radius=19),rect('Card readability',0,0,350,160,['#15122500','#151225bb'],19),text(names[i],14,71,260,24,17,'#ffffff',weight='SemiBold'),text(['조용히 내리는 비와\n부드러운 피아노가 만드는 평온한 밤','따뜻한 카페의 향기와\n잔잔한 음악이 흐르는 밤','맑은 숲속의 자연 소리로\n마음이 편안해지는 시간','부드러운 파도 소리와\n고요한 바다가 주는 휴식'][i],14,99,270,36,12,'#ffffff'),icon('play',303,113,26,theme='dark'),icon('more',315,12,23,theme='dark')]
    for j,label in enumerate([['비','피아노','바람'],['카페','비','안개'],['숲','바람','새소리'],['바다','피아노','바람']][i]):
     children.append(group(label,14+j*58,137,53,19,[rect('Tag surface',0,0,53,19,'#e9e3f2cc',10),text(label,0,2,53,15,10,'#403456','center')]))
    cards.append(group(names[i],0,i*170,350,160,children,target='07-detail'))
   ch += [group('탐색 결과 · 세로 스크롤',20,190,350,574,cards,clip=True,scroll='VERTICAL'),nav('05-home')]
  elif key=='07-detail':
   ch=background('player_moon_ocean')+[rect('Player lower readability',0,390,390,454,['#302a3b00','#302a3bee'] if mode=='dark' else ['#8c88ce00','#7779b9e8'])]+status(True)+header('분위기 상세','06-explore','heart')
   ch += [text(names[0],20,379,350,34,26,'#ffffff','center'),text('빗소리와 밤공기가 어우러진\n조용하고 포근한 공간',20,425,350,50,15,'#eee8fc','center')]
   incl=[text('포함된 사운드',18,14,314,24,17,weight='SemiBold')]
   for i,(a,b) in enumerate([('rain','비'),('wind','바람'),('piano','피아노')]):incl += [image('preset_detail/'+a,24+i*109,46,74,74,'FIT'),text(b,16+i*109,122,90,20,13,align='center')]
   ch += [glass('포함된 사운드',20,491,350,155,incl),glass('추천 시간대',20,656,350,44,[icon('moon',16,10,24),text('추천 시간대 · 잠들기 전',58,12,270,23,14,C['muted'])]),button('지금 이 분위기 듣기',711,'09-player','play'),button('내 취향대로 편집하기',775,'08-mixer','sliders',True)]
  elif key=='12-library':
   ch=background()+status(True)+header('나의 라이브러리',right='more')+tags(['전체','즐겨찾기','최근 저장'],20,102)
   for i in range(4):
    x=20+(i%2)*180;y=154+(i//2)*264
    ch.append(glass(names[i],x,y,170,250,[image('backgrounds_covers/'+covers[i],0,0,170,191,radius=18),icon('more',138,13,22,theme='dark'),rect('Play circle',124,144,36,36,'#ffffff77',18),icon('play',133,153,18,theme='dark'),text(names[i],8,202,156,22,15,weight='SemiBold'),group('사운드 태그',8,226,156,22,[group(label,j*52,0,49,22,[rect('Tag surface',0,0,49,22,C['glass'],11,stroke=C['stroke']),text(label,0,4,49,15,10,C['muted'],'center')]) for j,label in enumerate([['비','피아노','바람'],['카페','비','안개'],['숲','바람','새소리'],['바다','피아노','바람']][i])])],rad=18,target='07-detail'))
   ch.append(nav(key))
  elif key=='13-my':
   ch=background()+status(True)+[text('마이',20,54,250,28,22),icon('settings',343,52,26),image('backgrounds_covers/profile_crescent',145,114,100,100,'FILL',50),icon('pencil',224,186,26),text('나의 작은 휴식 공간',20,238,350,30,22,align='center',weight='SemiBold'),text('오늘도 포근한 하루가 되길',20,277,350,24,15,C['muted'],'center')]
   for i,(ico,label,val) in enumerate([('timer','기본 타이머','30분'),('moon','배경 테마','다크모드' if dark else '라이트모드'),('bell','알림 설정','ON'),('sliders','자동 페이드아웃','ON'),('settings','언어','한국어'),('info','앱 소개',''),('mail','문의하기','')]):
    y=333+i*56+(14 if i>=5 else 0);a=[icon(ico,15,16,28),text(label,62,19,190,25,17)]
    if val=='ON':a += [rect('Toggle ON',282,18,48,28,C['accent'],14),rect('Toggle thumb',304,21,22,22,'#ffffff',11)]
    else:a += [text(val,235,21,84,23,14,C['muted'],'right'),icon('back',324,23,14,rotation=180)]
    ch.append(glass(label,20,y,350,52,a,rad=20))
   ch.append(nav(key))
  elif key in ['10-timer','11-save']:
   ch=player() if key=='10-timer' else mixer()
   ch.append(rect('Modal backdrop',0,0,390,844,'#17132655'))
   a=[rect('Sheet surface',0,0,390,390,C['sheet'] if 'sheet' in C else ('#51485fee' if dark else '#f4f0ffef'),30,stroke=C['stroke']),rect('Sheet handle',172,14,46,6,C['accent'],3),icon('close',350,26,22)]
   if key=='10-timer':
    a += [text('언제까지 함께할까요?',20,48,350,30,23,align='center',weight='SemiBold'),text('원하는 시간 동안 이 분위기를 유지해보세요',20,87,350,24,14,C['muted'],'center')]
    for i,n in enumerate([15,30,45,60]):a.append(glass(str(n)+'분',20+i*89,124,82,80,[rect('Selected time',0,0,82,80,C['gradient'] if n==30 else '#ffffff00',24),icon('timer',29,14,24),text(str(n)+'분',0,49,82,22,15,align='center')],rad=24))
    a += [glass('직접 설정',20,214,350,44,[icon('sliders',14,10,24),text('직접 설정',55,12,280,23,15)]),glass('페이드아웃',20,268,350,44,[icon('sliders',14,10,24),text('끝나기 전 천천히 소리 줄이기',52,13,240,22,13),rect('Toggle ON',296,10,42,24,C['accent'],12),rect('Toggle thumb',315,12,20,20,'#ffffff',10)]),button('타이머 시작하기',327,'09-player','play')]
   else:
    a += [text('이 분위기를 저장할까요?',20,40,350,30,22,align='center',weight='SemiBold'),text('이름',20,84,350,22,14),glass('프리셋 이름',20,111,350,40,[text('비 내리는 새벽 창가',14,10,320,22,14)],rad=14),text('어떤 분위기인가요?',20,163,350,22,14)]+tags(['수면','집중','휴식','감성'],20,190)+[text('대표 무드 선택',20,231,350,22,14)]
    for i,c in enumerate(covers):a.append(image('backgrounds_covers/'+c,20+i*89,255,82,66,radius=12))
    a += [icon('check',70,295,20),button('이 분위기 저장하기',327,'12-library','bookmark')]
   ch.append(group('타이머 시트' if key=='10-timer' else '저장 시트',0,454,390,390,a))
  screens.append(dict(id=key,name=title,theme=mode,w=390,h=844,children=ch))
 return screens
for mode_ in ['light','dark']:allscreens.extend(build(mode_))
# Preserve every supplied source asset in the inventory, even assets not visible in default states.
for theme in ['light','dark']:
 for p in (ROOT/'rebuild/assets'/theme).rglob('*.png'):
  k=theme+'/'+str(p.relative_to(ROOT/'rebuild/assets'/theme).with_suffix(''))
  if k not in assets:assets[k]={'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
# Use the existing asset-specific display tone as a reversible paint filter.
tone_source=(ROOT/'rebuild/src/tones.ts').read_text()
parts=tone_source.split('export const darkTones')
tone_maps=[dict((k,float(v)) for k,v in re.findall(r'([a-z_]+): ([0-9.]+)',part)) for part in parts]
def walk(nodes,theme):
 for n in nodes:
  if n['type']=='image':
   key=n['asset'].split('/',1)[1].replace('/','_')
   n['saturation']=tone_maps[theme=='dark'].get(key,1)
  if 'children' in n:walk(n['children'],theme)
for s in allscreens:walk(s['children'],s['theme'])
# Expand prototype hit areas without enlarging/replacing the visible artwork.
def hitareas(nodes):
 for i,n in enumerate(list(nodes)):
  if 'children' in n:hitareas(n['children'])
  if n.get('target') and (n['w']<44 or n['h']<44):
   w,h=max(44,n['w']),max(44,n['h']);dx,dy=(w-n['w'])/2,(h-n['h'])/2
   wrapper=group(n['name']+' · touch area',n['x']-dx,n['y']-dy,w,h,[n],target=n.pop('target'))
   n['x'],n['y']=dx,dy;nodes[i]=wrapper
for s in allscreens:hitareas(s['children'])
project=dict(version='2026-11-05-review-1',font='Pretendard',screens=allscreens,assets=assets,notes=['Final boards first; PPT is reference data only.','Editable preparation, not an executed Figma file.','Image shapes are supplied assets, not regenerated.','Confirmed forward loop remains in app; Figma uses matching poster.'])
(OUT/'project.json').write_text(json.dumps(project,ensure_ascii=False,indent=2))
print(len(allscreens),'screens;',len(assets),'assets')
