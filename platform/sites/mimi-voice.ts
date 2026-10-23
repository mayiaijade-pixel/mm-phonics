import {CORGI_VOICE_ID,isCorgiScene} from '../../lib/blend-units';
import corgiAudio from '../../app/corgi-audio.json';
import {letterNamesForSpeech,letterNamesWithPhonemes} from '../../lib/voice-text';
import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {getChatGPTUser} from '../../app/chatgpt-auth';
import {getDatabase} from '../../db';
import segments from '../../app/mimi-segments.json';
import audio from '../../app/mimi-audio.json';
const fail=(status=503)=>Response.json({error:'미미 음성을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.'},{status});
const xml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sounds:Record<string,string>={hose:'HH OW1 Z',nose:'N OW1 Z',pose:'P OW1 Z',rose:'R OW1 Z',hope:'HH OW1 P',rope:'R OW1 P',note:'N OW1 T',vote:'V OW1 T',hop:'HH AA1 P',oh:'OW1',hole:'HH OW1 L',mole:'M OW1 L',pole:'P OW1 L',sole:'S OW1 L',dome:'D OW1 M',home:'HH OW1 M',bone:'B OW1 N',cone:'K OW1 N',not:'N AA1 T',cube:'K Y UW1 B',tube:'T UW1 B',cute:'K Y UW1 T',mute:'M Y UW1 T',dune:'D UW1 N',june:'JH UW1 N',tune:'T UW1 N',mule:'M Y UW1 L',cub:'K AH1 B',you:'Y UW1',cap:'K AE1 P',bake:'B EY1 K',cake:'K EY1 K',lake:'L EY1 K',rake:'R EY1 K',cape:'K EY1 P',tape:'T EY1 P',cave:'K EY1 V',wave:'W EY1 V',ay:'EY1',game:'G EY1 M',name:'N EY1 M',cane:'K EY1 N',lane:'L EY1 N',case:'K EY1 S',vase:'V EY1 S',date:'D EY1 T',gate:'G EY1 T',can:'K AE1 N',line:'L AY1 N',nine:'N AY1 N',pine:'P AY1 N',vine:'V AY1 N',bike:'B AY1 K',hike:'HH AY1 K',lime:'L AY1 M',time:'T AY1 M',pipe:'P AY1 P',wipe:'W AY1 P',hide:'HH AY1 D',ride:'R AY1 D',bite:'B AY1 T',kite:'K AY1 T',dive:'D AY1 V',five:'F AY1 V',pin:'P IH1 N',kit:'K IH1 T',eye:'AY1'};
const response=(base64:string)=>new Response(Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400'}});
Object.assign(sounds,{"black": "B L AE1 K", "block": "B L AA1 K", "blue": "B L UW1", "clap": "K L AE1 P", "cliff": "K L IH1 F", "clock": "K L AA1 K", "flag": "F L AE1 G", "flap": "F L AE1 P", "flute": "F L UW1 T", "glass": "G L AE1 S", "globe": "G L OW1 B", "glue": "G L UW1", "plane": "P L EY1 N", "plate": "P L EY1 T", "plum": "P L AH1 M", "sled": "S L EH1 D", "slide": "S L AY1 D", "slim": "S L IH1 M"});
Object.assign(sounds,{"brave": "B R EY1 V", "brick": "B R IH1 K", "bride": "B R AY1 D", "crab": "K R AE1 B", "crack": "K R AE1 K", "crane": "K R EY1 N", "frame": "F R EY1 M", "frog": "F R AA1 G", "frost": "F R AO1 S T", "dragon": "D R AE1 G AH0 N", "dress": "D R EH1 S", "drum": "D R AH1 M", "press": "P R EH1 S", "print": "P R IH1 N T", "prize": "P R AY1 Z", "track": "T R AE1 K", "truck": "T R AH1 K", "trumpet": "T R AH1 M P AH0 T", "smell": "S M EH1 L", "smile": "S M AY1 L", "snack": "S N AE1 K", "snake": "S N EY1 K", "stone": "S T OW1 N", "stop": "S T AA1 P", "swan": "S W AA1 N", "swim": "S W IH1 M"});
const pronunciationPattern=new RegExp('\\b('+Object.keys(sounds).join('|')+')\\b','gi');
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return fail(401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return fail(403);
 const parsed=z.object({scene:z.string().max(30).optional(),index:z.number().int().min(0).max(8).default(0),text:z.string().max(300).optional(),name:z.string().trim().min(1).max(30),unit:z.number().int().min(1).max(12).default(1)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return fail(400);
 const {scene,index,text,name,unit}=parsed.data;
 let template:string|undefined;
 if(scene==='greeting')template=['Hi, Jenny!',"I'm Mimi!","Let's discover a little magic with the letter a!"][index];
 else if(scene)template=(segments as Record<string,{text:string}[]>)[scene]?.[index]?.text;
 else if(text)template=Object.keys({...audio,...corgiAudio}).find(key=>key.replaceAll('Jenny',name)===text);
 if(!template)return fail(400);
 const spoken=letterNamesForSpeech(template.replaceAll('Jenny',name).replace('/eɪ/','ay').replace('/aɪ/','eye'));
 const runtime=env as unknown as Record<string,string>;
 const speaker=scene?(segments as Record<string,{speaker?:string}[]>)[scene]?.[index]?.speaker:undefined;
 const voice=(speaker?speaker==='corgi':isCorgiScene(scene)||(unit>=8&&unit<=12))?CORGI_VOICE_ID:runtime.ELEVENLABS_VOICE_ID||'BlgEcC0TfWpBak7FmvHW';
 if(!runtime.ELEVENLABS_API_KEY)return fail();
 const speed=scene==='greeting'||['u2-0','u3-0','u4-0','u5-0','u6-0','u7-0','u8-0','u9-0','u10-0','u11-0','u12-0'].includes(scene||'')?1:.86;
 const db=getDatabase();const now=Date.now();
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([user.userId,voice,spoken,'flash-v2',speed])));const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 try{
  const cached=await db.prepare('SELECT audio FROM mimi_voice_cache WHERE id=?').bind(id).first<{audio:string}>();if(cached?.audio)return response(cached.audio);
  if(cached)return fail(409);
  const recent=await db.prepare('SELECT COUNT(*) AS count FROM mimi_voice_cache WHERE user_id=? AND created_at>?').bind(user.userId,now-600000).first<{count:number}>();if((recent?.count||0)>=30)return fail(429);
  const reservation=await db.prepare('INSERT OR IGNORE INTO mimi_voice_cache (id,user_id,audio,created_at) VALUES (?,?,?,?)').bind(id,user.userId,'',now).run();if(!reservation.meta.changes)return fail(409);
  const tagged=letterNamesWithPhonemes(xml(spoken)).replace(pronunciationPattern,w=>`<phoneme alphabet="cmu-arpabet" ph="${sounds[w.toLowerCase()]}">${w}</phoneme>`);
  const generated=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':runtime.ELEVENLABS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:tagged,model_id:'eleven_flash_v2',voice_settings:{stability:.75,similarity_boost:.75,style:0,use_speaker_boost:true,speed}}),signal:AbortSignal.timeout(45000)});
  if(!generated.ok)throw Error('voice unavailable');
  const bytes=new Uint8Array(await generated.arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);const base64=btoa(binary);
  await db.prepare('UPDATE mimi_voice_cache SET audio=? WHERE id=?').bind(base64,id).run();return response(base64);
 }catch{await db.prepare('DELETE FROM mimi_voice_cache WHERE id=? AND audio=?').bind(id,'').run().catch(()=>{});return fail()}
}
