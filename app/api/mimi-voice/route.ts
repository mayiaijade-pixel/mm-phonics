import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {getChatGPTUser} from '../../chatgpt-auth';
import {getDatabase} from '../../../db';
import segments from '../../mimi-segments.json';
import audio from '../../mimi-audio.json';
const fail=(status=503)=>Response.json({error:'미미 음성을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.'},{status});
const xml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sounds:Record<string,string>={cap:'K AE1 P',bake:'B EY1 K',cake:'K EY1 K',lake:'L EY1 K',rake:'R EY1 K',cape:'K EY1 P',tape:'T EY1 P',cave:'K EY1 V',wave:'W EY1 V',ay:'EY1'};
const response=(base64:string)=>new Response(Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400'}});
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return fail(401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return fail(403);
 const parsed=z.object({scene:z.string().max(30).optional(),index:z.number().int().min(0).max(8).default(0),text:z.string().max(300).optional(),name:z.string().trim().min(1).max(30)}).safeParse(await request.json().catch(()=>null));if(!parsed.success)return fail(400);
 const {scene,index,text,name}=parsed.data;
 let template:string|undefined;
 if(scene==='greeting')template=['Hi, Jenny!',"I'm Mimi!","Let's discover a little magic with the letter a!"][index];
 else if(scene)template=(segments as Record<string,{text:string}[]>)[scene]?.[index]?.text;
 else if(text)template=Object.keys(audio).find(key=>key.replaceAll('Jenny',name)===text);
 if(!template)return fail(400);
 const spoken=template.replaceAll('Jenny',name).replace('/eɪ/','ay');
 const runtime=env as unknown as Record<string,string>;
 const voice=runtime.ELEVENLABS_VOICE_ID||'BlgEcC0TfWpBak7FmvHW';
 if(!runtime.ELEVENLABS_API_KEY)return fail();
 const speed=scene==='greeting'?1:.86;
 const db=getDatabase();const now=Date.now();
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([user.userId,voice,spoken,'flash-v2',speed])));const id=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 try{
  const cached=await db.prepare('SELECT audio FROM mimi_voice_cache WHERE id=?').bind(id).first<{audio:string}>();if(cached?.audio)return response(cached.audio);
  if(cached)return fail(409);
  const recent=await db.prepare('SELECT COUNT(*) AS count FROM mimi_voice_cache WHERE user_id=? AND created_at>?').bind(user.userId,now-600000).first<{count:number}>();if((recent?.count||0)>=30)return fail(429);
  const reservation=await db.prepare('INSERT OR IGNORE INTO mimi_voice_cache (id,user_id,audio,created_at) VALUES (?,?,?,?)').bind(id,user.userId,'',now).run();if(!reservation.meta.changes)return fail(409);
  const tagged=xml(spoken).replace(/\b(cap|bake|cake|lake|rake|cape|tape|cave|wave|ay)\b/gi,w=>`<phoneme alphabet="cmu-arpabet" ph="${sounds[w.toLowerCase()]}">${w}</phoneme>`);
  const generated=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':runtime.ELEVENLABS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:tagged,model_id:'eleven_flash_v2',voice_settings:{stability:.75,similarity_boost:.75,style:0,use_speaker_boost:true,speed}}),signal:AbortSignal.timeout(45000)});
  if(!generated.ok)throw Error('voice unavailable');
  const bytes=new Uint8Array(await generated.arrayBuffer());let binary='';for(const b of bytes)binary+=String.fromCharCode(b);const base64=btoa(binary);
  await db.prepare('UPDATE mimi_voice_cache SET audio=? WHERE id=?').bind(base64,id).run();return response(base64);
 }catch{await db.prepare('DELETE FROM mimi_voice_cache WHERE id=? AND audio=?').bind(id,'').run().catch(()=>{});return fail()}
}
