from pathlib import Path
import json,zipfile,copy
root=Path(__file__).resolve().parents[2];out=Path(__file__).resolve().parent;dest=Path('/tmp/sound-room-figma-delivery');dest.mkdir(exist_ok=True)
p=json.loads((out/'project.json').read_text())
for mode in ['light','dark']:
 part=copy.deepcopy(p);part['screens']=[s for s in part['screens'] if s['theme']==mode];used=set()
 def walk(ns):
  for n in ns:
   if n.get('asset'):used.add(n['asset'])
   walk(n.get('children',[]))
 for s in part['screens']:walk(s['children'])
 part['assets']={k:a for k,a in part['assets'].items() if k.startswith(mode+'/') or k in used}
 folder='SOUND_ROOM_'+mode;path=dest/(folder+'.zip')
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  z.writestr(folder+'/project.json',json.dumps(part,ensure_ascii=False))
  paths=set(a['path'] for a in part['assets'].values())
  for f in paths:z.write(root/f,folder+'/'+f)
  for f in (out/'plugin').iterdir():z.write(f,folder+'/plugin/'+f.name)
  for f in ['README.md','REVIEW.md']:z.write(out/f,folder+'/'+f)
  for f in (root/'assets/fonts').iterdir():z.write(f,folder+'/fonts/'+f.name)
  z.write(root/'rebuild/video/splash-star-flow-loop.mp4',folder+'/video/splash-star-flow-loop.mp4')
  ref=Path('/workspace/sound-room-new-reference-v1')
  for f in ref.glob('*.png'):
   if ('라이트' in f.name)==(mode=='light'):z.write(f,folder+'/references/'+f.name)
  for f in ref.glob('*.pptx'):z.write(f,folder+'/references/'+f.name)
 print(path,round(path.stat().st_size/1024**2,1),'MiB',len(part['assets']),'asset references')
