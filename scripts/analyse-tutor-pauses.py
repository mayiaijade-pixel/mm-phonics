"""Measure silence only; original speech recordings are never rewritten."""
from pathlib import Path
import json,subprocess,wave,numpy as np,hashlib,concurrent.futures
sources=set()
for path in ['app/mimi-audio.json','app/corgi-audio.json']:sources.update(json.loads(Path(path).read_text()).values())
for lines in json.loads(Path('app/mimi-segments.json').read_text()).values():sources.update(c['audio'] for c in lines if c.get('audio'))
sources.update(f'/audio/fena/greeting-natural-{i}.mp3' for i in [1,2,3])
folder=Path('/private/tmp/mimi-audio-timing');folder.mkdir(exist_ok=True)
def analyse(source):
 path=Path('public'+source)
 if not path.exists():return source,None
 dest=folder/(hashlib.sha256(source.encode()).hexdigest()[:20]+'.wav')
 if not dest.exists():subprocess.run(['/usr/bin/afconvert',str(path),str(dest),'-f','WAVE','-d','LEI16@16000','-c','1'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 with wave.open(str(dest),'rb') as w:rate=w.getframerate();samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
 frame=max(1,round(rate*.01));count=len(samples)//frame
 if not count:return source,None
 rms=np.sqrt(np.mean(samples[:count*frame].reshape(-1,frame)**2,axis=1));voiced=np.flatnonzero(rms>.0016)
 if not len(voiced):return source,None
 start=max(0,voiced[0]*.01-.06);pauses=[]
 for a,b in zip(voiced[:-1],voiced[1:]):
  left=(int(a)+1)*.01+.07;right=int(b)*.01-.07
  if right-left>=.16:pauses.append([round(left,3),round(right,3)])
 duration=len(samples)/rate;tail=(int(voiced[-1])+1)*.01+.12
 if duration-tail>=.08:pauses.append([round(tail,3),round(duration,3)])
 return source,{'start':round(start,3),'pauses':pauses}
result={}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,(source,timing) in enumerate(pool.map(analyse,sorted(sources))):
  if timing:result[source]=timing
  if i%60==0:print(f'{i+1}/{len(sources)} pause profiles ready',flush=True)
Path('app/tutor-timing.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print('Measured',len(result),'clips; original audio unchanged.',flush=True)
