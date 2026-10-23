import measured from '../app/tutor-timing.json';
export type TutorTiming={start:number;pauses:[number,number][]};
const dynamicTimings=new Map<string,TutorTiming>();
export const tutorRate=(corgi:boolean)=>corgi?.8:.9;
export const tutorGap=(milliseconds:number)=>Math.round(milliseconds*.9);
// Retain both consonants and their release: only measured silence is shortened.
export function pauseSeek(time:number,timing:TutorTiming,rate:number){
 for(const [start,end] of timing.pauses){const jumpAt=start+(end-start)*rate*.9;if(time>=jumpAt&&time<end-.004)return end}
 return null;
}
export function timingFromSamples(samples:Float32Array,sampleRate:number):TutorTiming|null{
 const frame=Math.max(1,Math.round(sampleRate*.01)),voiced:number[]=[];
 for(let start=0;start+frame<=samples.length;start+=frame){let sum=0;for(let j=0;j<frame;j++)sum+=samples[start+j]**2;if(Math.sqrt(sum/frame)>.0016)voiced.push(start/sampleRate)}
 if(!voiced.length)return null;
 const pauses:[number,number][]=[];
 for(let i=1;i<voiced.length;i++){const left=voiced[i-1]+.08,right=voiced[i]-.07;if(right-left>=.16)pauses.push([left,right])}
 const tail=voiced[voiced.length-1]+.13,duration=samples.length/sampleRate;if(duration-tail>=.08)pauses.push([tail,duration]);
 return {start:Math.max(0,voiced[0]-.06),pauses};
}
export async function registerTutorBlob(source:string,blob:Blob){
 try{if(!window.OfflineAudioContext)return;const context=new OfflineAudioContext(1,1,16000);const buffer=await context.decodeAudioData(await blob.arrayBuffer());const timing=timingFromSamples(buffer.getChannelData(0),buffer.sampleRate);if(timing)dynamicTimings.set(source,timing)}catch{/* Decoding support must never prevent playback. */}
}
export function createTutorAudio(source:string,corgi:boolean){
 const audio=new Audio(source),rate=tutorRate(corgi);
 audio.defaultPlaybackRate=rate;audio.playbackRate=rate;audio.preservesPitch=true;
 (audio as HTMLAudioElement&{webkitPreservesPitch?:boolean}).webkitPreservesPitch=true;
 const timing=dynamicTimings.get(source)||(measured as unknown as Record<string,TutorTiming>)[source];
 if(timing){
  audio.addEventListener('loadedmetadata',()=>{if(timing.start>0&&timing.start<audio.duration)audio.currentTime=timing.start},{once:true});
  let frame=0;
  const stop=()=>cancelAnimationFrame(frame);
  const tick=()=>{if(audio.paused||audio.ended)return;const seek=pauseSeek(audio.currentTime,timing,rate);if(seek!==null&&Number.isFinite(audio.duration))audio.currentTime=Math.min(seek,audio.duration-.001);frame=requestAnimationFrame(tick)};
  audio.addEventListener('play',()=>{stop();frame=requestAnimationFrame(tick)});
  audio.addEventListener('pause',stop);audio.addEventListener('ended',stop);
 }
 return audio;
}
