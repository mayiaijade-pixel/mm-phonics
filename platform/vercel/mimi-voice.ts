import {letterNamesForSpeech,letterNamesWithPhonemes} from '../../lib/voice-text';
import {z} from 'zod';
import {createHash} from 'node:crypto';
import {getChatGPTUser} from './auth';
import segments from '../../app/mimi-segments.json';
import audio from '../../app/mimi-audio.json';
const cache=new Map<string,{clip:Promise<Uint8Array>;created:number}>();
const limits=new Map<string,{count:number;until:number}>();
const fail=(status=503)=>Response.json({error:'미미 음성을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.'},{status});
const sounds:Record<string,string>={hose:'HH OW1 Z',nose:'N OW1 Z',pose:'P OW1 Z',rose:'R OW1 Z',hope:'HH OW1 P',rope:'R OW1 P',note:'N OW1 T',vote:'V OW1 T',hop:'HH AA1 P',oh:'OW1',hole:'HH OW1 L',mole:'M OW1 L',pole:'P OW1 L',sole:'S OW1 L',dome:'D OW1 M',home:'HH OW1 M',bone:'B OW1 N',cone:'K OW1 N',not:'N AA1 T',cube:'K Y UW1 B',tube:'T UW1 B',cute:'K Y UW1 T',mute:'M Y UW1 T',dune:'D UW1 N',june:'JH UW1 N',tune:'T UW1 N',mule:'M Y UW1 L',cub:'K AH1 B',you:'Y UW1',cap:'K AE1 P',bake:'B EY1 K',cake:'K EY1 K',lake:'L EY1 K',rake:'R EY1 K',cape:'K EY1 P',tape:'T EY1 P',cave:'K EY1 V',wave:'W EY1 V',ay:'EY1',game:'G EY1 M',name:'N EY1 M',cane:'K EY1 N',lane:'L EY1 N',case:'K EY1 S',vase:'V EY1 S',date:'D EY1 T',gate:'G EY1 T',can:'K AE1 N',line:'L AY1 N',nine:'N AY1 N',pine:'P AY1 N',vine:'V AY1 N',bike:'B AY1 K',hike:'HH AY1 K',lime:'L AY1 M',time:'T AY1 M',pipe:'P AY1 P',wipe:'W AY1 P',hide:'HH AY1 D',ride:'R AY1 D',bite:'B AY1 T',kite:'K AY1 T',dive:'D AY1 V',five:'F AY1 V',pin:'P IH1 N',kit:'K IH1 T',eye:'AY1'};
const xml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return fail(403);
 const user=await getChatGPTUser();if(!user)return fail(401);
 const parsed=z.object({scene:z.string().max(30).optional(),index:z.number().int().min(0).max(8).default(0),text:z.string().max(300).optional(),name:z.string().trim().min(1).max(30)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return fail(400);
 const {scene,index,text,name}=parsed.data;
 const template=scene==='greeting'?['Hi, Jenny!',"I'm Mimi!","Let's discover a little magic with the letter a!"][index]:scene?(segments as Record<string,{text:string}[]>)[scene]?.[index]?.text:text?Object.keys(audio).find(key=>key.replaceAll('Jenny',name)===text):undefined;
 if(!template||!process.env.ELEVENLABS_API_KEY)return fail(template?503:400);
 const spoken=letterNamesForSpeech(template.replaceAll('Jenny',name).replace('/eɪ/','ay').replace('/aɪ/','eye'));const speed=scene==='greeting'||['u2-0','u3-0','u4-0','u5-0','u6-0','u7-0'].includes(scene||'')?1:.86;
 const voice=process.env.ELEVENLABS_VOICE_ID||'BlgEcC0TfWpBak7FmvHW';
 const id=createHash('sha256').update(JSON.stringify([user.userId,voice,spoken,speed])).digest('hex');
 const now=Date.now();for(const [key,v] of cache)if(now-v.created>3600000)cache.delete(key);for(const [key,v]of limits)if(v.until<now)limits.delete(key);
 let cached=cache.get(id);
 if(!cached){
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||user.userId;
  const limit=limits.get(ip)||{count:0,until:now+600000};if(limit.count>=30)return fail(429);limit.count++;limits.set(ip,limit);
  if(cache.size>=200)cache.delete(cache.keys().next().value!);
  const clip=(async()=>{
   const tagged=letterNamesWithPhonemes(xml(spoken)).replace(/\b(hose|nose|pose|rose|hope|rope|note|vote|hop|oh|hole|mole|pole|sole|dome|home|bone|cone|not|cube|tube|cute|mute|dune|june|tune|mule|cub|you|cap|bake|cake|lake|rake|cape|tape|cave|wave|ay|game|name|cane|lane|case|vase|date|gate|can|line|nine|pine|vine|bike|hike|lime|time|pipe|wipe|hide|ride|bite|kite|dive|five|pin|kit|eye)\b/gi,w=>`<phoneme alphabet="cmu-arpabet" ph="${sounds[w.toLowerCase()]}">${w}</phoneme>`);
   const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY!,'Content-Type':'application/json'},body:JSON.stringify({text:tagged,model_id:'eleven_flash_v2',voice_settings:{stability:.75,similarity_boost:.75,style:0,use_speaker_boost:true,speed}}),signal:AbortSignal.timeout(45000)});
   if(!r.ok)throw Error('Voice unavailable');return new Uint8Array(await r.arrayBuffer());
  })();cached={clip,created:now};cache.set(id,cached);
 }
 try{return new Response(await cached.clip as Uint8Array<ArrayBuffer>,{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400'}})}catch{cache.delete(id);return fail()}
}
