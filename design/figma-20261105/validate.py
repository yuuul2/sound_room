from pathlib import Path
import json,hashlib,collections
root=Path(__file__).resolve().parents[2];out=Path(__file__).resolve().parent;p=json.loads((out/'project.json').read_text());stats=collections.Counter();missing=[]
def check(ns):
 for n in ns:
  stats[n['type']]+=1
  assert n['w']>0 and n['h']>0,n
  if n.get('target'):assert n['w']>=44 and n['h']>=44
  if n['type']=='image':assert n['asset'] in p['assets']
  check(n.get('children',[]))
for s in p['screens']:check(s['children'])
assert len(p['screens'])==26
for t in ['light','dark']:assert len([s for s in p['screens'] if s['theme']==t])==13
for a in p['assets'].values():assert hashlib.sha256((root/a['path']).read_bytes()).hexdigest()==a['sha256']
original=json.loads((root/'rebuild/asset-integrity.json').read_text())
for a in original:assert hashlib.sha256((root/a['path']).read_bytes()).hexdigest()==a['sha256']
result={'screens':26,'assetReferences':len(p['assets']),'originalFilesVerified':len(original),'layers':dict(stats),'textOverflowBrowser':json.loads((out/'audit/layout-check.json').read_text()),'figmaExecuted':False}
(out/'audit/validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(result)
