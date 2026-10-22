import json,re,hashlib,urllib.request,concurrent.futures
from pathlib import Path
data=json.loads(Path('scripts/unit-five-seven-data.json').read_text())
sounds=data['sounds'];scenes=data['scenes']
segments=json.loads(Path('app/mimi-segments.json').read_text());audio=json.loads(Path('app/mimi-audio.json').read_text())
cfg={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);cfg[k.strip()]=v.strip().strip(chr(34)).strip(chr(39))
voice=cfg.get('ELEVENLABS_VOICE_ID','BlgEcC0TfWpBak7FmvHW');key=cfg['ELEVENLABS_API_KEY'];folder=Path('public/audio/long-ou');folder.mkdir(parents=True,exist_ok=True)
items={(w,.8) for w in sounds}|{(t,1 if k.endswith('-0') else .9) for k,lines in scenes.items() for t in lines}
pattern=re.compile(r'\b('+'|'.join(sounds)+r')\b',re.I)
def generate(item):
 text,speed=item;spoken=text.replace('/aɪ/','eye');spoken=re.sub(r'\b(long|short|letter)\s+o\b',lambda m:m[1]+' oh',spoken,flags=re.I);spoken=re.sub(r'\b(long|short|letter)\s+u\b',lambda m:m[1]+' you',spoken,flags=re.I);spoken=re.sub(r'\b(long|short|letter)\s+i\b',lambda m:m[1]+' eye',spoken,flags=re.I);spoken=re.sub(r'\bthe\s+i\s+says\b','The eye says',spoken,flags=re.I);spoken=pattern.sub(lambda m:f'<phoneme alphabet="cmu-arpabet" ph="{sounds[m[0].lower()]}">{m[0]}</phoneme>',spoken)
 filename=hashlib.sha256((voice+spoken+str(speed)).encode()).hexdigest()[:20]+'.mp3';p=folder/filename
 if not p.exists():
  payload={'text':spoken,'model_id':'eleven_flash_v2','voice_settings':{'stability':.75,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':speed}}
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=60) as r:data=r.read()
   if len(data)<1000:raise ValueError('audio too short')
   p.write_bytes(data)
  except Exception as e:raise RuntimeError('Audio generation failed: '+type(e).__name__) from None
 return item,'/audio/long-ou/'+filename
lookup={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(item,url) in enumerate(pool.map(generate,items)):
  lookup[item]=url;print(f'{i+1}/{len(items)} long o/u clips ready',flush=True)
for w in sounds:audio[w]=lookup[(w,.8)]
for k,lines in scenes.items():segments[k]=[{'text':t,'audio':lookup[(t,1 if k.endswith('-0') else .9)]} for t in lines]
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n');Path('app/mimi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
