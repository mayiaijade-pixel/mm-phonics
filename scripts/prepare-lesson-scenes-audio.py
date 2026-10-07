"""Generate synchronized sentence clips and phoneme-specified example words."""
import json,urllib.request,hashlib,re
from pathlib import Path
cfg={}
for l in Path('.env.local').read_text().splitlines():
 if '=' in l and not l.startswith('#'):
  k,v=l.split('=',1);cfg[k.strip()]=v.strip().strip('\"').strip("'")
voice=cfg['ELEVENLABS_VOICE_ID'];key=cfg['ELEVENLABS_API_KEY']
phonemes={'cap':'K AE1 P','bake':'B EY1 K','cake':'K EY1 K','lake':'L EY1 K','rake':'R EY1 K','cape':'K EY1 P','tape':'T EY1 P','cave':'K EY1 V','wave':'W EY1 V','ay':'EY1'}
lines={
 '1':['Look, Jenny!','This is a cap.','Listen to the short a sound in cap.','Now say cap with me!'],
 '2':['Cap meets magic e!','Now cap plus e makes cape!'],
 '3':['Listen: ay!','Now say cape.','The final e is silent!'],
 '5':['Jenny, listen to the word.','Then tap the matching picture!'],
 '6':['Jenny, tap magic e.','Put it at the end of cap.','Let’s make cape!'],
 '7':['Great job, Jenny!','You discovered magic e!','For homework, work on Unit 1 in Speed Phonics Book 2.','Do pages 4 to 9 with your mom!'],
 'homework':['Jenny, work on Unit 1 in Speed Phonics Book 2.','Do pages 4 to 9 with your mom!']}
for w in list(phonemes)[1:9]:lines['4-'+w]=[f'Jenny, listen to {w}.','Say it with me!']
folder=Path('public/audio/fena');folder.mkdir(exist_ok=True)
def generate(text,speed):
 spoken=re.sub(r'\b(cap|bake|cake|lake|rake|cape|tape|cave|wave|ay)\b',lambda m:f'<phoneme alphabet="cmu-arpabet" ph="{phonemes[m[0]]}">{m[0]}</phoneme>',text,flags=0)
 filename='phonics-v3-'+hashlib.sha256((spoken+str(speed)).encode()).hexdigest()[:16]+'.mp3';p=folder/filename
 if not p.exists():
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps({'text':spoken,'model_id':'eleven_flash_v2','voice_settings':{'stability':.75,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':speed}}).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=90) as r:data=r.read()
  if len(data)<1000:raise RuntimeError('Missing audio')
  p.write_bytes(data)
 return '/audio/fena/'+filename
lookup=json.loads(Path('app/mimi-audio.json').read_text())
for w in phonemes:
 lookup[w]=generate(w+'.',.8)
 print('Word ready:',w,flush=True)
Path('app/mimi-audio.json').write_text(json.dumps(lookup,ensure_ascii=False,indent=2)+'\n')
segments={}
for scene,phrases in lines.items():
 segments[scene]=[{'text':phrase.replace('ay!','/eɪ/!'),'audio':generate(phrase,.86)} for phrase in phrases]
 print('Scene ready:',scene,flush=True)
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n')
