"""Bake blend-tutor speed and measured silence into files; mobile plays them at 1x.
Run with a local ffmpeg binary on PATH or FFMPEG_EXE. No provider calls or secrets.
"""
from pathlib import Path
import os,json,hashlib,subprocess,concurrent.futures
root=Path(__file__).resolve().parents[1]
segments=json.loads((root/'app/mimi-segments.json').read_text())
words=json.loads((root/'app/corgi-audio.json').read_text())
timings=json.loads((root/'app/tutor-timing.json').read_text())
items={(source,True) for source in words.values()}
for key,lines in segments.items():
 if key.startswith(tuple(f'u{n}-' for n in range(8,13))) or key.startswith('corgi-feedback-'):
  for line in lines:items.add((line['audio'],line.get('speaker','corgi')=='corgi'))
folder=root/'public/audio/mobile';folder.mkdir(exist_ok=True)
ffmpeg=os.environ.get('FFMPEG_EXE','ffmpeg')
def convert(item):
 source,corgi=item;rate=.8 if corgi else .9
 target=folder/(hashlib.sha256((source+str(rate)+'mobile-v1').encode()).hexdigest()[:20]+'.mp3')
 if not target.exists():
  timing=timings.get(source,{'start':0,'pauses':[]});cursor=timing['start'];parts=[]
  for start,end in timing['pauses']:
   cut=start+(end-start)*rate*.9
   if cut>cursor+.005:parts.append((cursor,cut))
   cursor=max(cursor,end)
  # Final interval also preserves unmeasured audio and consonant releases.
  parts.append((cursor,None))
  filters=[]
  for i,(start,end) in enumerate(parts):
   trim=f'atrim=start={start:.6f}'+(f':end={end:.6f}' if end is not None else '')
   filters.append(f'[0:a]{trim},asetpts=PTS-STARTPTS[p{i}]')
  inputs=''.join(f'[p{i}]' for i in range(len(parts)))
  filters.append(f'{inputs}concat=n={len(parts)}:v=0:a=1,atempo={rate}[out]')
  subprocess.run([ffmpeg,'-nostdin','-v','error','-y','-i',str(root/('public'+source)),'-filter_complex',';'.join(filters),'-map','[out]','-ac','1','-ar','44100','-b:a','128k',str(target)],check=True)
 return ('corgi:' if corgi else 'mimi:')+source,'/audio/mobile/'+target.name
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:result=dict(pool.map(convert,sorted(items)))
(root/'app/tutor-mobile-audio.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(result)} tutor recordings prepared for native 1x playback')
