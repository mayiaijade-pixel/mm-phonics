import json, urllib.request
from pathlib import Path
cfg={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);cfg[k.strip()]=v.strip().strip('\"').strip("'")
request=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+cfg['ELEVENLABS_VOICE_ID']+'?output_format=mp3_44100_128',data=json.dumps({'text':'<phoneme alphabet="cmu-arpabet" ph="EY1">ay</phoneme>.','model_id':'eleven_flash_v2','voice_settings':{'stability':.85,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':.7}}).encode(),headers={'xi-api-key':cfg['ELEVENLABS_API_KEY'],'Content-Type':'application/json'})
with urllib.request.urlopen(request,timeout=90) as response: audio=response.read()
if len(audio)<1000: raise RuntimeError('Missing audio')
Path('public/audio/fena/ay-slow-20261008.mp3').write_bytes(audio)
p=Path('app/mimi-audio.json');lookup=json.loads(p.read_text());lookup['ay']='/audio/fena/ay-slow-20261008.mp3';p.write_text(json.dumps(lookup,ensure_ascii=False,indent=2)+'\n')
print('Slow ay audio generated:',len(audio),'bytes')
