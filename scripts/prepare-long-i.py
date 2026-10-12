"""Create the Unit 3 / 4 dialogue and same-voice phoneme-specified recordings."""
import json,re,hashlib,urllib.request,concurrent.futures
from pathlib import Path
sets={3:['line','nine','pine','vine','bike','hike','lime','time'],4:['pipe','wipe','hide','ride','bite','kite','dive','five']}
sounds={'line':'L AY1 N','nine':'N AY1 N','pine':'P AY1 N','vine':'V AY1 N','bike':'B AY1 K','hike':'HH AY1 K','lime':'L AY1 M','time':'T AY1 M','pipe':'P AY1 P','wipe':'W AY1 P','hide':'HH AY1 D','ride':'R AY1 D','bite':'B AY1 T','kite':'K AY1 T','dive':'D AY1 V','five':'F AY1 V','pin':'P IH1 N','kit':'K IH1 T','eye':'AY1'}
examples={'line':"Let's draw a line!",'nine':'Count with me. Nine!','pine':'Look at the green pine tree!','vine':'The vine grows up and up!','bike':'Look at this bike!','hike':"Let's hike up the hill!",'lime':'This is a green lime.','time':"What time is it?",'pipe':'Water goes through a pipe.','wipe':"Let's wipe the window!",'hide':"Let's hide behind the bush!",'ride':"Let's ride in the wagon!",'bite':'Take a little bite!','kite':'The kite flies in the sky!','dive':"Let's dive into the water!",'five':'Count with me. Five!'}
segments=json.loads(Path('app/mimi-segments.json').read_text());audio=json.loads(Path('app/mimi-audio.json').read_text());scenes={};unitOf={}
for unit,words in sets.items():
 short,long=('pin','pine') if unit==3 else ('kit','kite')
 scenes.update({f'u{unit}-0':['Hi, Jenny!',"Let's discover magic with the letter i!" if unit==3 else "Welcome back! Let's learn more long i words!"],f'u{unit}-1':['Look, Jenny!',f'This is a {short}.',f'Listen to the short i sound in {short}.',f'Now say {short} with me!'],f'u{unit}-2':[f'{short.title()} meets magic e!',f'Now {short} plus e makes {long}!','The i says eye, and the final e is silent.'],f'u{unit}-3':['When short i meets magic e!?','It makes the sound /aɪ/!'],f'u{unit}-5':['Jenny, listen to the word.','Then tap the matching picture!'],f'u{unit}-6':['Jenny, tap magic e.',f'Put it at the end of {short}.',f'Let’s make {long}!'],f'u{unit}-7':['Great job, Jenny!','You learned eight new long i words!',f'For homework, review Unit {unit} in Speed Phonics Book 2 with your mom.'],f'u{unit}-homework':[f'Jenny, review Unit {unit} in Speed Phonics Book 2 with your mom.','Listen to each word, then say it again!']})
 for w in words:scenes[f'u{unit}-4-{w}']=[f'Jenny, listen to {w}.',examples[w],'Say it with me!']
 for w in words+[short]:unitOf[w]=unit
for w in sounds:
 audio.setdefault(w,'')
 lines=[f'I heard {w}! Great job!',f'Good try! Listen to {w}, then say it again.',f'Good try! Listen to {w}, then say it again.',"I couldn't hear clearly. Let's try again!"]
 if w=='eye':lines=["I heard the long i sound! Great job!","Good try! Listen to the long i sound, then say it again.","Good try! Listen to the long i sound, then say it again.","I couldn't hear clearly. Let's try again!"]
 segments['feedback-'+w]=[{'text':t,'audio':''} for t in lines]
for k,lines in scenes.items():segments[k]=[{'text':t,'audio':''} for t in lines]
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n');Path('app/mimi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
cfg={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);cfg[k.strip()]=v.strip().strip(chr(34)).strip(chr(39))
voice=cfg.get('ELEVENLABS_VOICE_ID','BlgEcC0TfWpBak7FmvHW');key=cfg['ELEVENLABS_API_KEY'];folder=Path('public/audio/long-i');folder.mkdir(parents=True,exist_ok=True)
items={(w,.8) for w in sounds}|{(t,1 if k.endswith('-0') else .9) for k,lines in scenes.items() for t in lines}
pattern=re.compile(r'\b('+'|'.join(sounds)+r')\b',re.I)
def generate(item):
 text,speed=item;spoken=text.replace('/aɪ/','eye');spoken=re.sub(r'\b(long|short|letter)\s+i\b',lambda m:m[1]+' eye',spoken,flags=re.I);spoken=re.sub(r'\bthe\s+i\s+says\b','The eye says',spoken,flags=re.I);spoken=pattern.sub(lambda m:f'<phoneme alphabet="cmu-arpabet" ph="{sounds[m[0].lower()]}">{m[0]}</phoneme>',spoken)
 filename=hashlib.sha256((voice+spoken+str(speed)).encode()).hexdigest()[:20]+'.mp3';p=folder/filename
 if not p.exists():
  payload={'text':spoken,'model_id':'eleven_flash_v2','voice_settings':{'stability':.75,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':speed}}
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=60) as r:data=r.read()
   if len(data)<1000:raise ValueError('audio too short')
   p.write_bytes(data)
  except Exception as e:raise RuntimeError('Audio generation failed: '+type(e).__name__) from None
 return item,'/audio/long-i/'+filename
lookup={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(item,url) in enumerate(pool.map(generate,items)):
  lookup[item]=url;print(f'{i+1}/{len(items)} long i clips ready',flush=True)
for w in sounds:audio[w]=lookup[(w,.8)]
for k,lines in scenes.items():segments[k]=[{'text':t,'audio':lookup[(t,1 if k.endswith('-0') else .9)]} for t in lines]
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n');Path('app/mimi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
Path('app/long-i-dialogue.json').write_text(json.dumps({'words':examples,'scenes':scenes},ensure_ascii=False,indent=2)+'\n')
