import json, urllib.request
from pathlib import Path
cfg={}
for line in Path('.env.local').read_text().splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);cfg[k.strip()]=v.strip().strip('\"').strip("'")
for index,text in enumerate(['Hi, Jenny!',"I'm Mimi!","Let's discover a little magic with the letter a!"],1):
 req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+cfg['ELEVENLABS_VOICE_ID']+'?output_format=mp3_44100_128',data=json.dumps({'text':text,'model_id':'eleven_flash_v2','voice_settings':{'stability':.75,'similarity_boost':.75,'style':0,'use_speaker_boost':True,'speed':1}}).encode(),headers={'xi-api-key':cfg['ELEVENLABS_API_KEY'],'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=90) as r:audio=r.read()
 if len(audio)<1000:raise RuntimeError('Missing audio')
 Path(f'public/audio/fena/greeting-natural-{index}.mp3').write_bytes(audio)
 print('Greeting clip ready:',index)
