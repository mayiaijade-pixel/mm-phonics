"""Regenerate guide lines where a means the alphabet letter, not the article."""
import json,re,hashlib,urllib.request,concurrent.futures
from pathlib import Path
cfg={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);cfg[k.strip()]=v.strip().strip(chr(34)).strip(chr(39))
voice=cfg.get('ELEVENLABS_VOICE_ID','BlgEcC0TfWpBak7FmvHW');key=cfg['ELEVENLABS_API_KEY']
segments=json.loads(Path('app/mimi-segments.json').read_text());audio=json.loads(Path('app/mimi-audio.json').read_text())
greeting="Let's discover a little magic with the letter a!"
pattern=re.compile(r'\b(?:long|short|letter)\s+a\b|\bthe\s+a\s+says\b',re.I)
sounds={'ay':'EY1','cap':'K AE1 P','cape':'K EY1 P','can':'K AE1 N','cane':'K EY1 N'}
items={(t,.86) for t in audio if pattern.search(t)}|{(c['text'],.9 if scene.startswith('u2-') else .86) for scene,clips in segments.items() for c in clips if pattern.search(c['text'])}
items.add((greeting,1))
folder=Path('public/audio/letter-a');folder.mkdir(parents=True,exist_ok=True)
def make(item):
 text,speed=item;spoken=re.sub(r'\b(long|short|letter)\s+a\b',lambda m:m[1]+' A',text,flags=re.I);spoken=re.sub(r'\bthe\s+a\s+says\b','The A says',spoken,flags=re.I);spoken=spoken.replace('/eɪ/','ay')
 letter='<phoneme alphabet="cmu-arpabet" ph="EY1">A</phoneme>'
 spoken=re.sub(r'\b(long|short|letter)\s+A\b',lambda m:m[1]+' '+letter,spoken,flags=re.I)
 spoken=re.sub(r'\bthe\s+A\s+says\b','The '+letter+' says',spoken,flags=re.I)
 spoken=re.sub(r'\b(ay|cap|cape|can|cane)\b',lambda m:f'<phoneme alphabet="cmu-arpabet" ph="{sounds[m[0].lower()]}">{m[0]}</phoneme>',spoken,flags=re.I)
 filename=hashlib.sha256((voice+spoken+str(speed)).encode()).hexdigest()[:20]+'.mp3';p=folder/filename
 if not p.exists():
  payload={'text':spoken,'model_id':'eleven_flash_v2','voice_settings':{'stability':.75,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':speed}}
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=60) as r:data=r.read()
   if len(data)<1000:raise ValueError()
   p.write_bytes(data)
  except Exception as e:raise RuntimeError('Audio generation failed: '+type(e).__name__) from None
 return item,'/audio/letter-a/'+filename
lookup={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(item,url) in enumerate(pool.map(make,items)):
  lookup[item]=url;print(f'{i+1}/{len(items)} corrected guide clips ready',flush=True)
for text in audio:
 if pattern.search(text):audio[text]=lookup[(text,.86)]
for scene,clips in segments.items():
 for c in clips:
  if pattern.search(c['text']):c['audio']=lookup[(c['text'],.9 if scene.startswith('u2-') else .86)]
audio[greeting]=lookup[(greeting,1)]
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n');Path('app/mimi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
p=Path('app/lesson.tsx');s=p.read_text().replace("audio:'/audio/fena/greeting-natural-3.mp3'", 'audio:mimiAudio["'+greeting+'"]');p.write_text(s)
