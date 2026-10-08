import {getChatGPTUser} from '@platform/auth';
import {speechKey} from '@platform/key';
import {targets,feedbackFor} from '../../../lib/pronunciation';
export const maxDuration=60;
const limits=new Map<string,{count:number;until:number}>();
const error=(message:string,status:number)=>Response.json({error:message},{status});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return error('요청을 확인해 주세요.',403);
 const user=await getChatGPTUser();if(!user)return error('화면을 새로고침한 뒤 다시 시도해 주세요.',401);
 if(Number(request.headers.get('content-length')||0)>2200000)return error('녹음이 너무 길어요. 한 단어만 말해주세요.',413);
 const key=speechKey();if(!key)return error('음성 확인 서비스가 아직 연결되지 않았어요.',503);
 const now=Date.now();for(const [id,v]of limits)if(v.until<now)limits.delete(id);
 const id=request.headers.get('x-forwarded-for')?.split(',')[0]||user.userId;
 const limit=limits.get(id)||{count:0,until:now+600000};if(limit.count>=30)return error('조금 쉬었다가 다시 연습해요.',429);
 let form:FormData;try{form=await request.formData()}catch{return error('녹음을 읽지 못했어요.',400)}
 const file=form.get('audio'),target=String(form.get('target')||'');
 if(!(file instanceof File)||!targets.includes(target as typeof targets[number])||file.size<200||file.size>2000000||!['audio/webm','audio/mp4','audio/ogg','audio/wav','audio/mpeg'].includes(file.type.split(';')[0]))return error('녹음 파일과 연습 단어를 확인해 주세요.',400);
 limit.count++;limits.set(id,limit);
 const upload=new FormData();upload.set('file',file);upload.set('model_id','scribe_v2');upload.set('language_code','eng');upload.set('tag_audio_events','false');upload.set('diarize','false');
 try{const r=await fetch('https://api.elevenlabs.io/v1/speech-to-text',{method:'POST',headers:{'xi-api-key':key},body:upload,signal:AbortSignal.timeout(45000)});if(!r.ok)return error(r.status===401||r.status===403?'ElevenLabs 키의 Speech to Text 권한을 확인해 주세요.':'음성을 확인하지 못했어요. 잠시 후 다시 시도해주세요.',503);const d=await r.json() as {text?:string};return Response.json(feedbackFor(target,d.text||''),{headers:{'Cache-Control':'no-store'}})}catch{return error('연결이 지연됐어요. 잠시 후 다시 확인해주세요.',503)}
}
