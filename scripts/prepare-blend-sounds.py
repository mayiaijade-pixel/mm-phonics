"""Generate isolated consonant clusters with phoneme tags, at their final native speed."""
from pathlib import Path
import json,urllib.request,concurrent.futures,hashlib,os
root=Path(__file__).resolve().parents[1]
phones={'bl':'B L','cl':'K L','fl':'F L','gl':'G L','pl':'P L','sl':'S L','br':'B R','cr':'K R','fr':'F R','dr':'D R','pr':'P R','tr':'T R','sm':'S M','sn':'S N','st':'S T','sw':'S W'}
ipa={'cl':'kl','gl':'ɡl','cr':'kr'}
config={}
for line in (root/'.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  key,value=line.split('=',1);config[key.strip()]=value.strip().strip('\"').strip("'")
folder=root/'public/audio/blends';folder.mkdir(exist_ok=True)
voice='nLxulrrbRg9nJamIJY8Z'
def generate(item):
 family,phonemes=item
 text=f'<phoneme alphabet="cmu-arpabet" ph="{phonemes}">{family}</phoneme>.'
 payload={'text':text,'model_id':'eleven_flash_v2','voice_settings':{'stability':.9,'similarity_boost':.8,'style':0,'use_speaker_boost':True,'speed':.8}}
 digest=hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()[:12]
 path=folder/f'{family}-{digest}.mp3'
 if not path.exists():
  req=urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128',data=json.dumps(payload).encode(),headers={'xi-api-key':config['ELEVENLABS_API_KEY'],'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=60) as response:audio=response.read()
  if len(audio)<1000:raise RuntimeError(f'Empty {family} sound')
  path.write_bytes(audio)
 return family,{'phonemes':phonemes,'ipa':'/'+ipa.get(family,family)+'/', 'audio':'/audio/blends/'+path.name}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:data=dict(pool.map(generate,phones.items()))
(root/'app/blend-sounds.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'{len(data)} isolated blend sounds generated')
