"""Build the six test tracks from recorded, redistributable source audio.
Requires numpy + ffmpeg. Originals remain outside the application asset folder.
"""
import numpy as np,subprocess,json,hashlib,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]);out=root/'audio';out.mkdir(exist_ok=True)
sr=44100;duration=48;n=sr*duration

def decode(path):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar',str(sr),'-f','f32le','-']),dtype='<f4').copy()
def encode(name,data,processing):
 data=data-np.mean(data);rms=np.sqrt(np.mean(data**2));gain=min(.045/max(rms,1e-9),.20/max(np.max(np.abs(data)),1e-9));data*=gain
 target=out/(name+'.mp3')
 subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(sr),'-ac','1','-i','pipe:0','-c:a','libmp3lame','-b:a','128k',str(target)],input=data.astype('<f4').tobytes(),check=True)
 decoded=decode(target);row={'id':name,'file':target.name,'durationSeconds':len(decoded)/sr,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'peakDbfs':float(20*np.log10(max(np.max(np.abs(decoded)),1e-9))),'rmsDbfs':float(20*np.log10(max(np.sqrt(np.mean(decoded**2)),1e-9))),'processing':processing};print(name,row['durationSeconds'],row['peakDbfs']);return row
results=[]
for name in ['rain','ocean','wind','cafe','forest']:
 data=decode(source/(name+'.ogg'));cross=sr*2
 if len(data)<n+cross:data=np.tile(data,int(np.ceil((n+cross)/len(data)))+1)
 data=data[:n+cross];head=data[:cross];tail=data[n:n+cross];ramp=np.linspace(0,1,cross)
 data[:cross]=tail*(1-ramp)+head*ramp;data=data[:n]
 results.append(encode(name,data,'48-second mono excerpt; 2-second linear loop splice; DC removal; fixed gain capped at 0.20 peak; MP3 128k.'))
# Original sparse arpeggio arrangement, using real CC0 upright-piano recordings.
notes={note:decode(source/('piano-'+note+'.ogg')) for note in ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4']}
chords=[['C3','G3','E4','B3'],['A3','E3','C4','G4'],['F3','C4','A3','E4'],['G3','D4','A3','B3']]
track=np.zeros(n,dtype=np.float64)
for bar in range(8):
 chord=chords[bar%4]
 for step,note in enumerate(chord):
  start=int((bar*6+step*1.5)*sr);sample=notes[note].astype(np.float64)*[.72,.55,.48,.42][step]
  # Wrap the natural tails across the repeat boundary, preserving note decay.
  indices=(np.arange(len(sample))+start)%n;np.add.at(track,indices,sample)
results.append(encode('piano',track,'Original 48-second, 8-bar sparse arpeggio arrangement of Meta Piano Vel01 CC0 recorded samples; periodic natural note tails; mono MP3 128k.'))
(out/'integrity.json').write_text(json.dumps(results,indent=2)+'\n')
