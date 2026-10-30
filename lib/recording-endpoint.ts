// End a short practice recording after speech, never after initial silence alone.
export function createSpeechEndpoint(silenceMs=1000){
 let voiceMs=0,lastVoice:number|null=null,lastTime:number|null=null;
 return (rms:number,now:number)=>{
  const elapsed=lastTime===null?0:Math.min(100,Math.max(0,now-lastTime));lastTime=now;
  if(rms>=.012){voiceMs+=elapsed;lastVoice=now}
  return voiceMs>=120&&lastVoice!==null&&now-lastVoice>=silenceMs;
 };
}
export function watchSpeechEnd(stream:MediaStream,onEnd:()=>void){
 const AudioContextClass=window.AudioContext||(window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
 if(!AudioContextClass)return ()=>{};
 let context:AudioContext|null=null,source:MediaStreamAudioSourceNode|null=null,frame=0,closed=false;
 const cleanup=()=>{if(closed)return;closed=true;cancelAnimationFrame(frame);source?.disconnect();if(context&&context.state!=='closed')void context.close().catch(()=>{})};
 try{
  context=new AudioContextClass();source=context.createMediaStreamSource(stream);
  const analyser=context.createAnalyser();analyser.fftSize=2048;source.connect(analyser);
  // Deliberately no connection to destination: the mic is never played through speakers.
  const samples=new Float32Array(analyser.fftSize),ended=createSpeechEndpoint();
  const tick=(now:number)=>{if(closed)return;analyser.getFloatTimeDomainData(samples);let sum=0;for(const v of samples)sum+=v*v;if(ended(Math.sqrt(sum/samples.length),now)){cleanup();onEnd();return}frame=requestAnimationFrame(tick)};
  void context.resume().then(()=>{if(!closed)frame=requestAnimationFrame(tick)}).catch(cleanup);
 }catch{cleanup()}
 return cleanup;
}
