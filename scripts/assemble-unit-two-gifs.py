"""Assemble generated two-panel animation strips into looped word-card GIFs."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'scripts/unit-two-image-prompts.json').read_text())
out=root/'public/images/unit2';out.mkdir(parents=True,exist_ok=True)
for asset in manifest:
 src=Image.open(asset['source']).convert('RGB');w,h=src.size
 frames=[src.crop((i*w//2,0,(i+1)*w//2,h)).resize((480,480),Image.Resampling.LANCZOS) for i in range(2)]
 # A shared palette avoids color flicker as the two poses alternate.
 palette=Image.new('RGB',(960,480));palette.paste(frames[0],(0,0));palette.paste(frames[1],(480,0));palette=palette.quantize(colors=256)
 indexed=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in frames]
 indexed[0].save(out/(asset['word']+'.gif'),save_all=True,append_images=indexed[1:],duration=[850,850],loop=0,optimize=False,disposal=2)
 frames[0].save(out/(asset['word']+'.png'))
 assert Image.open(out/(asset['word']+'.gif')).n_frames==2
# Contact sheet for visual inspection, not used as a lesson image.
words=[a['word'] for a in manifest if a['word']!='can'];sheet=Image.new('RGB',(960,540),'#f9f5ff');draw=ImageDraw.Draw(sheet)
for i,word in enumerate(words):
 img=Image.open(out/(word+'.png')).resize((230,230));x=(i%4)*240+5;y=(i//4)*270;sheet.paste(img,(x,y));draw.text((x+90,y+239),word,fill='#513378')
sheet.save(root/'unit-two-assets-preview.jpg')
print('GIF assets ready:',len(manifest))
