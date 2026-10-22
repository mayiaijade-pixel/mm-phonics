"""Build Unit 2 narration and word assets using the configured Mimi voice."""
import json,hashlib,urllib.request,concurrent.futures
from pathlib import Path
words=['game','name','cane','lane','case','vase','date','gate','can']
sounds=dict(zip(words,['G EY1 M','N EY1 M','K EY1 N','L EY1 N','K EY1 S','V EY1 S','D EY1 T','G EY1 T','K AE1 N']))
scenes={
'u2-0':['Hi, Jenny!',"Welcome back! Let's learn more long a words!"],
'u2-1':['Look, Jenny! This is a can.','Listen to the short a sound in can.','Now say can with me!'],
'u2-2':['Can meets magic e!','Now can plus e makes cane!','The a says ay, and the final e is silent.'],
'u2-3':['When short a meets magic e!?','It makes the sound /eɪ/!'],
'u2-5':['Jenny, listen to the word.','Then tap the matching picture!'],
'u2-6':['Jenny, tap magic e.','Put it at the end of can.','Let’s make cane!'],
'u2-7':['Great job, Jenny!','You learned eight new long a words!','For homework, review Unit 2 in Speed Phonics Book 2 with your mom.'],
'u2-homework':['Jenny, review Unit 2 in Speed Phonics Book 2 with your mom.','Listen to each word, then say it again!']}
examples={'game':"Let's play a game!",'name':'My name is Mimi!','cane':'This is a walking cane.','lane':"Let's walk down the lane!",'case':'Open the case!','vase':'Put flowers in the vase!','date':"What's the date today?",'gate':'Open the garden gate!'}
for w in words[:-1]:scenes['u2-4-'+w]=[f'Jenny, listen to {w}.',examples[w],'Say it with me!']
segments=json.loads(Path('app/mimi-segments.json').read_text());audio=json.loads(Path('app/mimi-audio.json').read_text())
for w in words:
 scenes['feedback-'+w]=[f'I heard {w}! Great job!',f'Good try! Listen to {w}, then say it again.',f'Good try! Listen to {w}, then say it again.',"I couldn't hear clearly. Let's try again!"]
 for i,t in enumerate(scenes['feedback-'+w]):segments.setdefault('feedback-'+w,[])
 segments['feedback-'+w]=[{'text':t,'audio':''} for t in scenes['feedback-'+w]]
# Produce all scene scripts before network work, even if audio generation fails.
for key,lines in scenes.items():
 if key.startswith('u2-'):segments[key]=[{'text':t,'audio':''} for t in lines]
for w in words:audio.setdefault(w,'')
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n');Path('app/mimi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
config={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);config[k.strip()]=v.strip().strip(chr(34)).strip(chr(39))
key=config['ELEVENLABS_API_KEY'];voice=config.get('ELEVENLABS_VOICE_ID','BlgEcC0TfWpBak7FmvHW')
out=Path('public/audio/unit2');out.mkdir(parents=True,exist_ok=True)
import re
pattern=re.compile(r'\b('+'|'.join(words)+r'|ay)\b',re.I);sounds['ay']='EY1'
def generate(item):
 text,speed=item;spoken=text.replace('/eɪ/','ay');spoken=re.sub(r'\b(long|short|letter)\s+a\b',lambda m:m[1]+' A',spoken,flags=re.I);spoken=re.sub(r'\bthe\s+a\s+says\b','The A says',spoken,flags=re.I);letter='<phoneme alphabet="cmu-arpabet" ph="EY1">A</phoneme>';spoken=re.sub(r'\b(long|short|letter)\s+A\b',lambda m:m[1]+' '+letter,spoken,flags=re.I);spoken=re.sub(r'\bthe\s+A\s+says\b','The '+letter+' says',spoken,flags=re.I);tagged=pattern.sub(lambda m:f'<phoneme alphabet="cmu-arpabet" ph="{sounds[m[0].lower()]}">{m[0]}</phoneme>',spoken)
 filename=hashlib.sha256((voice+tagged+str(speed)).encode()).hexdigest()[:20]+'.mp3';p=out/filename
 if not p.exists():
  data={'text':tagged,'model_id':'eleven_flash_v2','voice_settings':{'stability':.75,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':speed}}
  req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(data).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=60) as r:blob=r.read()
   if len(blob)<1000:raise ValueError('audio too short')
   p.write_bytes(blob)
  except Exception as e:raise RuntimeError('Audio generation failed: '+type(e).__name__) from None
 return text,speed,'/audio/unit2/'+filename
items=set([(w,.8) for w in words]+[(t,1 if k=='u2-0' else .9) for k,lines in scenes.items() if k.startswith('u2-') for t in lines])
lookup={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(text,speed,url) in enumerate(pool.map(generate,items)):
  lookup[(text,speed)]=url;print(f'{i+1}/{len(items)} Unit 2 clips ready',flush=True)
for w in words:audio[w]=lookup[(w,.8)]
for k,lines in scenes.items():
 if k.startswith('u2-'):segments[k]=[{'text':t,'audio':lookup[(t,1 if k=='u2-0' else .9)]} for t in lines]
Path('app/mimi-segments.json').write_text(json.dumps(segments,ensure_ascii=False,indent=2)+'\n');Path('app/mimi-audio.json').write_text(json.dumps(audio,ensure_ascii=False,indent=2)+'\n')
Path('app/unit-two-dialogue.json').write_text(json.dumps({'words':examples,'scenes':{k:v for k,v in scenes.items() if k.startswith('u2-')}},ensure_ascii=False,indent=2)+'\n')
