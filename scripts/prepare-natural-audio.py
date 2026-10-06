from pathlib import Path
import subprocess,wave,json
out=Path('public/audio/natural');out.mkdir(parents=True,exist_ok=True)
voice='Sandy (영어(미국))'
words=['bake','cake','lake','rake','cape','tape','cave','wave','cap']
lines=["Hi, Jenny! I'm Mimi. Let's discover a little magic with the letter a!","Look, Jenny! This is a cap. Listen to the short a sound in cap. Now say cap with me!","Look, Jenny! Magic e is here! With one consonant between a and e, the silent e helps a say its name. Cap becomes cape!","Jenny, let's say long a! Start with your mouth a little open, then gently close it a little. Listen to A, then say cape. The final e is silent!","Jenny, listen to the word. Then tap the matching picture!","Jenny, tap magic e and put it at the end of cap. Let's make cape!","Great job, Jenny! You discovered magic e! For homework, work on Unit 1 in Speed Phonics Book 2, pages 4 to 9, with your mom!","Jenny, work on Unit 1 in Speed Phonics Book 2, pages 4 to 9, with your mom!","Are you ready, Jenny? Let's learn together!","Yes, Jenny! You found it! Great job!","Let's listen one more time. Try again!","A"]
wordlines=['We are baking cookies in the oven!','Look at this yummy strawberry cake!','This lake is calm and blue.','A rake helps us gather leaves.','Look at this lovely purple cape!','We can use tape to stick paper together.','Here is a cave in the rocks!','A wave is curling in the sea!']
lines += [f'Jenny, {line} Listen to {word}, then say it with me!' for word,line in zip(words,wordlines)]
clips=[]
for word in words:clips.append((word,word+'.',105))
for i,line in enumerate(lines):clips.append(('mimi-'+str(i),line,145))
lookup={}
for key,line,rate in clips:
 subprocess.run(['say','-v',voice,'-r',str(rate),'-o',str(out/(key+'.wav')),'--data-format=LEI16@22050',line],check=True)
 # Only append silence; never reshape, repeat, or stretch the waveform.
 with wave.open(str(out/(key+'.wav')),'rb') as src:params=src.getparams();frames=src.readframes(src.getnframes())
 with wave.open(str(out/(key+'.wav')),'wb') as dst:dst.setparams(params);dst.writeframes(frames+b'\x00\x00'*int(params.framerate*.3))
 if key.startswith('mimi-'):lookup[line]='/audio/natural/'+key+'.wav'
Path('app/mimi-audio.json').write_text(json.dumps(lookup,ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(clips),'natural clips; no waveform manipulation')
