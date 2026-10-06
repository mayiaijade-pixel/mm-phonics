"""Prepare complete word clips, preserving final consonants and playback padding.
Source: local macOS Samantha speech synthesis at 90 wpm; mono 22050 Hz PCM.
Regenerate raw inputs with say before running using the bundled NumPy runtime.
"""
from pathlib import Path
import wave
import numpy as np

def stretch(signal, factor):
    # WSOLA: extend duration without changing voice pitch.
    frame=512; hop=128; search=96
    data=np.pad(signal,(frame,frame))
    result=np.zeros(int(len(data)*factor)+frame*3)
    weight=np.zeros_like(result)
    win=np.hanning(frame)
    pos=0; previous=None
    for outpos in range(0,int(len(signal)*factor)+frame,hop):
        expected=frame+int(outpos/factor)
        if previous is not None:
            lo=max(frame,expected-search);hi=min(len(data)-frame,expected+search)
            target=previous[hop:]
            scores=[]
            for candidate in range(lo,hi+1,8):
                part=data[candidate:candidate+frame-hop]
                scores.append((float(np.dot(target,part)/(np.linalg.norm(target)*np.linalg.norm(part)+1e-10)),candidate))
            pos=max(scores)[1] if scores else expected
        else: pos=expected
        chunk=data[pos:pos+frame]
        if len(chunk)<frame:chunk=np.pad(chunk,(0,frame-len(chunk)))
        result[outpos:outpos+frame]+=chunk*win
        weight[outpos:outpos+frame]+=win
        previous=chunk
    result/=np.maximum(weight,1e-8)
    return result[:int(len(signal)*factor)]

outdir=Path('public/audio');outdir.mkdir(exist_ok=True)
# The voiceless onset of pie supplies a released /p/, cut before vowel voicing.
with wave.open('/private/tmp/mimi-word-audio/pie.wav') as src:
    p_release=np.frombuffer(src.readframes(int(src.getframerate()*.040)),np.int16).astype(float)/32768
p_release*=3.0
p_release[-110:]*=np.linspace(1,0,110)
for word in ['bake','cake','lake','rake','cape','tape','cave','wave','cap']:
    with wave.open('/private/tmp/mimi-word-audio/'+word+'.wav') as src:
        rate=src.getframerate();x=np.frombuffer(src.readframes(src.getnframes()),np.int16).astype(float)/32768
    # Keep the complete original ending, including quiet release sounds.
    if word in ['cave','wave']:
        end=int(np.flatnonzero(np.abs(x)>.0004)[-1])+1
        begin=max(0,end-int(rate*.115))
        tail=stretch(x[begin:end],2.4)
        fade=int(rate*.006)
        tail[:fade]=x[begin:begin+fade]*(1-np.linspace(0,1,fade))+tail[:fade]*np.linspace(0,1,fade)
        tail*=np.linspace(1,2.1,len(tail))
        x=np.concatenate([x[:begin],tail,x[end:]])
    else:
        # Stop consonants are released, not lengthened into an added vowel.
        start=int(rate*.50) if word in ['cape','tape','cap'] else int(len(x)*.78)
        x[start:]*=np.linspace(1,4,len(x)-start)
    x=stretch(x,1.28)
    if word in ['cape','tape','cap']:
        x=np.concatenate([x,p_release])
    x=np.concatenate([np.zeros(int(rate*.07)),x,np.zeros(int(rate*.40))])
    peak=np.max(np.abs(x));x*=min(1.5,.93/max(peak,1e-9))
    with wave.open(str(outdir/(word+'.wav')),'wb') as dst:
        dst.setnchannels(1);dst.setsampwidth(2);dst.setframerate(rate);dst.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes())
    assert np.isfinite(x).all() and np.max(np.abs(x))>.05
    assert np.max(np.abs(x[-int(rate*.3):]))==0
    print(word,round(len(x)/rate,2),'seconds; complete ending + trailing silence')
