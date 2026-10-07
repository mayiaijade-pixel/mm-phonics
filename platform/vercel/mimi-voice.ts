import {z} from 'zod';
import {createHash} from 'node:crypto';
import {getChatGPTUser} from './auth';
import segments from '../../app/mimi-segments.json';
import audio from '../../app/mimi-audio.json';
const cache=new Map<string,{clip:Promise<Uint8Array>;created:number}>();
const limits=new Map<string,{count:number;until:number}>();
const fail=(status=503)=>Response.json({error:'미미 음성을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.'},{status});
const sounds:Record<string,string>={cap:'K AE1 P',bake:'B EY1 K',cake:'K EY1 K',lake:'L EY1 K',rake:'R EY1 K',cape:'K EY1 P',tape:'T EY1 P',cave:'K EY1 V',wave:'W EY1 V',ay:'EY1'};
const xml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return fail(403);
 const user=await getChatGPTUser();if(!user)return fail(401);
 const parsed=z.object({scene:z.string().max(30).optional(),index:z.number().int().min(0).max(8).default(0),text:z.string().max(300).optional(),name:z.string().trim().min(1).max(30)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return fail(400);
 const {scene,index,text,name}=parsed.data;
 const template=scene==='greeting'?['Hi, Jenny!',"I'm Mimi!","Let's discover a little magic with the letter a!"][index]:scene?(segments as Record<string,{text:string}[]>)[scene]?.[index]?.text:text?Object.keys(audio).find(key=>key.replaceAll('Jenny',name)===text):undefined;
 if(!template||!process.env.ELEVENLABS_API_KEY)return fail(template?503:400);
 const spoken=template.replaceAll('Jenny',name).replace('/eɪ/','ay');const speed=scene==='greeting'?1:.86;
 const voice=process.env.ELEVENLABS_VOICE_ID||'BlgEcC0TfWpBak7FmvHW';
 const id=createHash('sha256').update(JSON.stringify([user.userId,voice,spoken,speed])).digest('hex');
 const now=Date.now();for(const [key,v] of cache)if(now-v.created>3600000)cache.delete(key);for(const [key,v]of limits)if(v.until<now)limits.delete(key);
 let cached=cache.get(id);
 if(!cached){
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||user.userId;
  const limit=limits.get(ip)||{count:0,until:now+600000};if(limit.count>=30)return fail(429);limit.count++;limits.set(ip,limit);
  if(cache.size>=200)cache.delete(cache.keys().next().value!);
  const clip=(async()=>{
   const tagged=xml(spoken).replace(/\b(cap|bake|cake|lake|rake|cape|tape|cave|wave|ay)\b/gi,w=>`<phoneme alphabet="cmu-arpabet" ph="${sounds[w.toLowerCase()]}">${w}</phoneme>`);
   const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY!,'Content-Type':'application/json'},body:JSON.stringify({text:tagged,model_id:'eleven_flash_v2',voice_settings:{stability:.75,similarity_boost:.75,style:0,use_speaker_boost:true,speed}}),signal:AbortSignal.timeout(45000)});
   if(!r.ok)throw Error('Voice unavailable');return new Uint8Array(await r.arrayBuffer());
  })();cached={clip,created:now};cache.set(id,cached);
 }
 try{return new Response(await cached.clip as Uint8Array<ArrayBuffer>,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400'}})}catch{cache.delete(id);return fail()}
}
