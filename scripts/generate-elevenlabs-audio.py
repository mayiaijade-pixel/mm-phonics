"""Generate Fena lesson assets. Key is read locally, never stored in assets/source."""
import json,urllib.request,urllib.error,hashlib,sys
from pathlib import Path
config={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);config[k.strip()]=v.strip().strip(chr(34)).strip(chr(39))
key=config['ELEVENLABS_API_KEY'];voice='BlgEcC0TfWpBak7FmvHW'
words=['cap','bake','cake','lake','rake','cape','tape','cave','wave']
lines=["Hi, Jenny! I'm Mimi. Let's discover a little magic with the letter a!","Look, Jenny! This is a cap. Listen to the short a sound in cap. Now say cap with me!","Cap meets magic e! Now cap plus e makes cape!","Listen: ay! Now say cape. The final e is silent!","Jenny, listen to the word. Then tap the matching picture!","Jenny, tap magic e and put it at the end of cap. Let's make cape!","Great job, Jenny! You discovered magic e! For homework, work on Unit 1 in Speed Phonics Book 2, pages 4 to 9, with your mom!","Jenny, work on Unit 1 in Speed Phonics Book 2, pages 4 to 9, with your mom!","Are you ready, Jenny? Let's learn together!","Yes, Jenny! You found it! Great job!","Let's listen one more time. Try again!","Hello, Jenny!"]+[f'Jenny, listen to {w}. Say it with me!' for w in words[1:]]
out=Path('public/audio/fena');out.mkdir(parents=True,exist_ok=True);lookup={}
items=[(w,w+'.',.75) for w in words]+[(line,line,.86) for line in lines]+[('ay','Aye.',.75)]
for i,(text,spoken,speed) in enumerate(items):
 filename=hashlib.sha256((voice+spoken+str(speed)).encode()).hexdigest()[:16]+'.mp3';p=out/filename
 if not p.exists():
  payload={'text':spoken,'model_id':'eleven_multilingual_v2','language_code':'en','voice_settings':{'stability':.7,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':speed}}
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=90) as r:data=r.read()
   if len(data)<1000:raise ValueError('Audio response too short')
   p.write_bytes(data)
  except urllib.error.HTTPError as e:
   detail=json.loads(e.read()).get('detail',{});print(json.dumps({'http':e.code,'detail':detail}).replace(key,'[REDACTED]'),flush=True);sys.exit(1)
  except Exception as e:print('Generation failed:',type(e).__name__,flush=True);sys.exit(1)
 lookup[text]='/audio/fena/'+filename
 print(str(i+1)+'/'+str(len(items))+' audio clips ready',flush=True)
# Keep phoneme-corrected assets when refreshing the older narration library.
existing=json.loads(Path('app/mimi-audio.json').read_text())
lookup.update({k:v for k,v in existing.items() if 'phonics-v3-' in v or 'cape-long-a-v2' in v})
Path('app/mimi-audio.json').write_text(json.dumps(lookup,ensure_ascii=False,indent=2)+'\n')
Path('public/audio/fena/voice-info.json').write_text(json.dumps({'voice_id':voice,'voice_name':'Fena - Girly, Young and Sassy Hero','model':'eleven_multilingual_v2','word_speed':.75,'narration_speed':.86},indent=2)+'\n')
print('All Fena clips ready',flush=True)
