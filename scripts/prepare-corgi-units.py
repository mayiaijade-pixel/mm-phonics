"""Generate Unit 8/9 Kogi narration and reusable word recordings. Secrets stay in .env.local."""
from pathlib import Path
import json,urllib.request,hashlib,concurrent.futures,re,time
VOICE='nLxulrrbRg9nJamIJY8Z'
MIMI='BlgEcC0TfWpBak7FmvHW'
SOUNDS={'black':'B L AE1 K','block':'B L AA1 K','blue':'B L UW1','clap':'K L AE1 P','cliff':'K L IH1 F','clock':'K L AA1 K','flag':'F L AE1 G','flap':'F L AE1 P','flute':'F L UW1 T','glass':'G L AE1 S','globe':'G L OW1 B','glue':'G L UW1','plane':'P L EY1 N','plate':'P L EY1 T','plum':'P L AH1 M','sled':'S L EH1 D','slide':'S L AY1 D','slim':'S L IH1 M'}
scenes={}
for unit,words,families,start,end in [(8,list(SOUNDS)[:9],['bl','cl','fl'],50,55),(9,list(SOUNDS)[9:],['gl','pl','sl'],56,61)]:
 prefix=f'u{unit}-';first=words[0]
 scenes[prefix+'0']=['Hi, Jenny!',"I'm Mimi!","I'm Kogi!","We'll blend two letters and two sounds!"]
 scenes[prefix+'1']=[f'Look at {first}!',f'Listen to the first two sounds in {first}.',f'Now say {first} with me!']
 scenes[prefix+'2']=['Keep both sounds.','Blend them smoothly!']
 scenes[prefix+'3']=[f'Listen to {first}.','Blend the first two sounds.',f'Now say {first} with me!']
 scenes[prefix+'5']=['Listen carefully.','Which picture matches the word?']
 scenes[prefix+'7']=['Great job, Jenny!','You earned three stars!',f'For homework, complete Unit {unit}, pages {start} to {end}, in Speed Phonics Book 2!']
 scenes[prefix+'homework']=[f'For homework, complete Unit {unit}, pages {start} to {end}, in Speed Phonics Book 2!']
 for group in range(3):
  a,b,c=words[group*3:group*3+3]
  scenes[prefix+'blend-'+families[group]]=[f'Listen: {a}, {b}, {c}.','Keep both beginning sounds together!']
 for word in words:
  scenes[prefix+'4-'+word]=[f'Jenny, listen to {word}.','Say it with me!']
  scenes['corgi-feedback-'+word]=['Good job! You did it!',f'Listen to {word}. Blend both beginning sounds.',f'Good try! Listen to {word}, then say it again.',"I couldn't hear clearly. Let's try again!"]
scenes['corgi-feedback-success']=['Good job! You did it!']
audio={'Yes, Jenny! You found it! Great job!':None,"Let's listen one more time. Try again!":None}
def speaker(scene,index):
 if not re.match(r'u[89]-',scene):return 'corgi'
 if scene.endswith('-0'):return 'corgi' if index==2 else 'mimi'
 return 'mimi' if index%2==0 else 'corgi'
def voice_for(scene,index):return MIMI if speaker(scene,index)=='mimi' else VOICE
items={(word,.8,VOICE) for word in SOUNDS}|{(text,1 if scene.endswith('-0') else .92,voice_for(scene,index)) for scene,lines in scenes.items() for index,text in enumerate(lines)}|{(text,.95,VOICE) for text in audio}
cfg={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);cfg[k.strip()]=v.strip().strip('\"').strip("'")
folder=Path('public/audio/corgi');folder.mkdir(parents=True,exist_ok=True)
pattern=re.compile(r'\b('+'|'.join(SOUNDS)+r')\b',re.I)
def generate(item):
 text,speed,voice=item
 spoken=pattern.sub(lambda m:f'<phoneme alphabet="cmu-arpabet" ph="{SOUNDS[m[0].lower()]}">{m[0]}</phoneme>',text)
 target=folder/(hashlib.sha256((voice+spoken+str(speed)).encode()).hexdigest()[:20]+'.mp3')
 if not target.exists():
  data=json.dumps({'text':spoken,'model_id':'eleven_flash_v2','voice_settings':{'stability':.8,'similarity_boost':.8,'style':0,'use_speaker_boost':True,'speed':speed}}).encode()
  for attempt in range(3):
   try:
    req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=data,headers={'xi-api-key':cfg['ELEVENLABS_API_KEY'],'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=60) as r:clip=r.read()
    if len(clip)<1000:raise RuntimeError('Empty audio')
    target.write_bytes(clip);break
   except urllib.error.HTTPError as e:
    if e.code==429 and attempt<2:time.sleep(3);continue
    raise RuntimeError(f'Voice generation failed ({e.code})') from None
 return item,'/audio/corgi/'+target.name
lookup={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(item,url) in enumerate(pool.map(generate,sorted(items))):
  lookup[item]=url
  if i%10==0:print(f'{i+1}/{len(items)} Kogi recordings ready',flush=True)
segments=json.loads(Path('app/mimi-segments.json').read_text())
for scene,lines in scenes.items():segments[scene]=[{'text':text,'audio':lookup[(text,1 if scene.endswith('-0') else .92,voice_for(scene,index))],'speaker':speaker(scene,index)} for index,text in enumerate(lines)]
for word in SOUNDS:audio[word]=lookup[(word,.8,VOICE)]
for text in list(audio):
 if audio[text] is None:audio[text]=lookup[(text,.95,VOICE)]
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n')
Path('app/corgi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
Path('scripts/corgi-scenes.json').write_text(json.dumps({'voice':VOICE,'scenes':scenes},ensure_ascii=False,indent=2)+'\n')
print('Kogi Unit 8/9 audio complete.',flush=True)
