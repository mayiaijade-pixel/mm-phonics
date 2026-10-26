import {actionSchema,sessionInput,studentSchema,STUDENTS,type ClassSession,type ClassState} from './model';
import {signToken,readToken,sessionCookie,cookieHeader} from './tokens';
export type ClassRuntime={db:D1Database;bucket:R2Bucket;secret:string;password:string;teacherPassword?:string;publicBase?:string};
const SITES_ORIGIN='https://mimi-magic-e-jenny.aiplane-jade.chatgpt.site';
const allowed=new Set([SITES_ORIGIN,'https://mm-phonics.vercel.app','http://localhost:3001','http://localhost:3000','http://localhost:5173','http://127.0.0.1:3001']);
class ClassError extends Error{constructor(message:string,public status=400){super(message)}}
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function mutationOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||(!allowed.has(origin)&&origin!==new URL(request.url).origin))throw new ClassError('요청한 주소를 확인해 주세요.',403)}
async function session(request:Request,r:ClassRuntime):Promise<ClassSession|null>{const data=await readToken(sessionCookie(request),r.secret,'session');if(!data||!['class','student','teacher'].includes(String(data.role)))return null;if(data.role==='student'&&!studentSchema.safeParse(data.student).success)return null;return {role:data.role as ClassSession['role'],...(data.role==='student'?{student:data.student as typeof STUDENTS[number]}:{})}}
function need(s:ClassSession|null,role?:'student'|'teacher'){if(!s)throw new ClassError('Angel class 비밀번호를 입력해 주세요.',401);if(role&&s.role!==role)throw new ClassError(role==='teacher'?'선생님으로 입장해 주세요.':'학생을 선택해 주세요.',403);return s}
async function assignment(r:ClassRuntime,id:string){const a=await r.db.prepare('SELECT * FROM angel_assignments WHERE id=? AND archived=0').bind(id).first<{id:string;week:string;kind:string}>();if(!a)throw new ClassError('숙제 항목이 변경됐어요. 새로고침해 주세요.',409);return a}
function studentKey(id:string,student:string){return id+':'+student}
async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('')}
async function checkPassword(request:Request,r:ClassRuntime,password:string,expected:string,scope:string){
 const id=scope+':'+await digest(request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]||'local');
 const row=await r.db.prepare('SELECT failures,locked_until FROM angel_login_attempts WHERE id=?').bind(id).first<{failures:number;locked_until:number}>();const now=Date.now();
 if(row&&row.locked_until>now)throw new ClassError('입력 횟수가 많아요. 5분 뒤 다시 시도해 주세요.',429);
 if(await digest(password)!==await digest(expected)){
  await r.db.prepare('INSERT INTO angel_login_attempts (id,failures,locked_until) VALUES (?,1,0) ON CONFLICT(id) DO UPDATE SET failures=CASE WHEN locked_until>0 AND locked_until<=? THEN 1 ELSE failures+1 END, locked_until=CASE WHEN failures>=4 AND (locked_until=0 OR locked_until>?) THEN ? ELSE 0 END').bind(id,now,now,now+300000).run();throw new ClassError('비밀번호를 확인해 주세요.',403);
 }
 await r.db.prepare('DELETE FROM angel_login_attempts WHERE id=?').bind(id).run();
}
async function sessionAction(request:Request,r:ClassRuntime){
 mutationOrigin(request);const parsed=sessionInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw new ClassError('다시 입력해 주세요.');const data=parsed.data;
 const current=await session(request,r);let next:ClassSession|null=null;
 if(data.action==='login'){if(typeof data.password!=='string'||data.password.length>128)throw new ClassError('비밀번호를 입력해 주세요.');await checkPassword(request,r,data.password,r.password,'class');next={role:'class'}}
 else if(data.action==='select'){need(current);if(data.role==='teacher'){if(!r.teacherPassword)throw new ClassError('선생님 비밀번호 설정을 준비하고 있어요.',503);if(r.teacherPassword){if(typeof data.password!=='string')throw new ClassError('선생님 비밀번호를 입력해 주세요.');await checkPassword(request,r,data.password,r.teacherPassword,'teacher')}next={role:'teacher'}}else{const student=studentSchema.safeParse(data.student);if(!student.success)throw new ClassError('학생 이름을 선택해 주세요.');next={role:'student',student:student.data}}}
 else if(data.action==='switch'){need(current);next={role:'class'}}
 else if(data.action!=='logout')throw new ClassError('지원하지 않는 요청이에요.');
 const token=next?await signToken({purpose:'session',...next},r.secret):'';return Response.json({session:next,teacherProtected:!!r.teacherPassword},{headers:{'Set-Cookie':cookieHeader(token,request),'Cache-Control':'no-store'}});
}
async function state(request:Request,r:ClassRuntime){
 const s=await session(request,r);const empty:ClassState={session:s,teacherProtected:!!r.teacherPassword,assignments:[],submissions:[]};
 if(!s||s.role==='class')return json(empty);
 const [a,b]=await Promise.all([
  r.db.prepare('SELECT id,week,title,kind,position FROM angel_assignments WHERE archived=0 ORDER BY week,position').all(),
  r.db.prepare('SELECT s.assignment_id,s.student,s.done,s.updated_at,u.id AS video_id FROM angel_submissions s JOIN angel_assignments a ON a.id=s.assignment_id AND a.archived=0 LEFT JOIN angel_uploads u ON u.id=s.upload_id AND u.status=\'ready\' WHERE s.done=1').all()
 ]);
 const base=r.publicBase||new URL(request.url).origin;
 const submissions=await Promise.all(b.results.map(async(row)=>({assignmentId:String(row.assignment_id),student:String(row.student),done:!!row.done,uploadedAt:row.video_id?String(row.updated_at):null,videoUrl:row.video_id?`${base}/api/angel-class/media?token=${await signToken({purpose:'play',id:row.video_id},r.secret,3600)}`:null})));
 return json({...empty,assignments:a.results,submissions});
}
async function action(request:Request,r:ClassRuntime){
 mutationOrigin(request);const s=need(await session(request,r));const parsed=actionSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw new ClassError('항목과 영상 형식·크기(80MB 이하)를 확인해 주세요.');const input=parsed.data;const now=new Date().toISOString();
 if(input.action==='publish'){
  need(s,'teacher');const existing=await r.db.prepare('SELECT id,week,kind FROM angel_assignments WHERE id IN (SELECT value FROM json_each(?))').bind(JSON.stringify(input.items.map(i=>i.id))).all<{id:string;week:string;kind:string}>();
  if(existing.results.some(a=>a.week!==input.week))throw new ClassError('다른 주차의 항목은 바꿀 수 없어요.',409);
  for(const item of input.items){const old=existing.results.find(a=>a.id===item.id);if(old&&old.kind!==item.kind){const submitted=await r.db.prepare('SELECT id FROM angel_submissions WHERE assignment_id=? AND done=1 LIMIT 1').bind(item.id).first();if(submitted)throw new ClassError('이미 제출한 숙제의 방식은 바꿀 수 없어요. 새 항목을 추가해 주세요.',409)}}
  await r.db.batch([
   r.db.prepare('UPDATE angel_assignments SET archived=1,updated_at=? WHERE week=? AND id NOT IN (SELECT value FROM json_each(?))').bind(now,input.week,JSON.stringify(input.items.map(i=>i.id))),
   ...input.items.map((i,position)=>r.db.prepare('INSERT INTO angel_assignments (id,week,title,kind,position,archived,updated_at) VALUES (?,?,?,?,?,0,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,kind=excluded.kind,position=excluded.position,archived=0,updated_at=excluded.updated_at').bind(i.id,input.week,i.title,i.kind,position,now))
  ]);return json({saved:true});
 }
 const student=need(s,'student').student!;const a=await assignment(r,input.assignmentId);const id=studentKey(a.id,student);
 if(input.action==='complete'){
  if(a.kind!=='check')throw new ClassError('동영상 숙제는 영상을 제출해 주세요.');
  await r.db.prepare('INSERT INTO angel_submissions (id,assignment_id,student,done,upload_id,updated_at) VALUES (?,?,?,?,NULL,?) ON CONFLICT(id) DO UPDATE SET done=excluded.done,updated_at=excluded.updated_at').bind(id,a.id,student,input.done?1:0,now).run();return json({saved:true});
 }
 if(input.action==='remove-video'){
  if(a.kind!=='video')throw new ClassError('동영상 항목을 선택해 주세요.');
  const old=await r.db.prepare('SELECT u.id,u.storage_key FROM angel_uploads u JOIN angel_submissions s ON s.upload_id=u.id WHERE s.id=? AND s.student=?').bind(id,student).first<{id:string;storage_key:string}>();
  if(old){const changed=await r.db.prepare('UPDATE angel_submissions SET upload_id=NULL,done=0,updated_at=? WHERE id=? AND student=? AND upload_id=?').bind(now,id,student,old.id).run();if(!changed.meta.changes)throw new ClassError('영상이 바뀌었어요. 목록을 다시 확인해 주세요.',409);await r.db.prepare('UPDATE angel_uploads SET status=\'deleted\' WHERE id=?').bind(old.id).run();await r.bucket.delete(old.storage_key)}return json({saved:true});
 }
 if(a.kind!=='video')throw new ClassError('동영상 숙제 항목을 선택해 주세요.');
 const uploadId=crypto.randomUUID(),storageKey='angel-class/'+uploadId;
 const outstanding=await r.db.prepare('SELECT count(*) AS n FROM angel_uploads WHERE student=? AND created_at>?').bind(student,new Date(Date.now()-3600000).toISOString()).first<{n:number}>();if((outstanding?.n||0)>=30)throw new ClassError('업로드가 많아요. 잠시 뒤 다시 제출해 주세요.',429);
 await r.db.prepare('INSERT INTO angel_uploads (id,assignment_id,student,storage_key,content_type,size,status,created_at) VALUES (?,?,?,?,?,?,\'pending\',?)').bind(uploadId,a.id,student,storageKey,input.contentType,input.size,now).run();
 const token=await signToken({purpose:'upload',id:uploadId},r.secret,900);return json({url:`${r.publicBase||new URL(request.url).origin}/api/angel-class/upload?token=${token}`});
}
async function upload(request:Request,r:ClassRuntime){
 mutationOrigin(request);const token=await readToken(new URL(request.url).searchParams.get('token')||'',r.secret,'upload');if(!token)throw new ClassError('업로드 시간이 지났어요. 다시 제출해 주세요.',401);
 const row=await r.db.prepare('SELECT * FROM angel_uploads WHERE id=? AND status=\'pending\'').bind(token.id).first<{id:string;assignment_id:string;student:string;storage_key:string;content_type:string;size:number}>();if(!row)throw new ClassError('이미 처리한 업로드예요. 다시 제출해 주세요.',409);
 const a=await assignment(r,row.assignment_id);if(a.kind!=='video')throw new ClassError('동영상 숙제가 변경됐어요.',409);
 if(!request.body||Number(request.headers.get('content-length'))!==row.size||request.headers.get('content-type')?.split(';')[0]!==row.content_type)throw new ClassError('영상 크기와 형식이 일치하지 않아요.');
 // Atomically consume the ticket so retries cannot replace a previously accepted upload.
 const claim=await r.db.prepare('UPDATE angel_uploads SET status=\'uploading\' WHERE id=? AND status=\'pending\'').bind(row.id).run();if(!claim.meta.changes)throw new ClassError('다른 업로드가 진행 중이에요.',409);
 try{
  await r.bucket.put(row.storage_key,request.body,{httpMetadata:{contentType:row.content_type,cacheControl:'private, no-store'}});
  const sample=await r.bucket.get(row.storage_key,{range:{offset:0,length:16}});const header=sample?new Uint8Array(await sample.arrayBuffer()):new Uint8Array();const atom=new TextDecoder().decode(header.slice(4,8));const valid= row.content_type==='video/webm'?header[0]===0x1a&&header[1]===0x45&&header[2]===0xdf&&header[3]===0xa3:['ftyp','moov','mdat','wide','free','skip'].includes(atom);if(!valid)throw new ClassError('재생할 수 있는 동영상 파일을 선택해 주세요.',415);
  const previous=await r.db.prepare('SELECT u.id,u.storage_key FROM angel_uploads u JOIN angel_submissions s ON s.upload_id=u.id WHERE s.id=?').bind(studentKey(row.assignment_id,row.student)).first<{id:string;storage_key:string}>();
  const now=new Date().toISOString();
  const saved=await r.db.batch([
   r.db.prepare('UPDATE angel_uploads SET status=\'ready\' WHERE id=?').bind(row.id),
   r.db.prepare('INSERT INTO angel_submissions (id,assignment_id,student,done,upload_id,updated_at) SELECT ?,?,?,1,?,? WHERE EXISTS(SELECT 1 FROM angel_assignments WHERE id=? AND archived=0 AND kind=\'video\') ON CONFLICT(id) DO UPDATE SET done=1,upload_id=excluded.upload_id,updated_at=excluded.updated_at').bind(studentKey(row.assignment_id,row.student),row.assignment_id,row.student,row.id,now,row.assignment_id)
  ]);if(!saved[1].meta.changes)throw new ClassError('숙제 항목이 바뀌었어요. 목록을 다시 확인해 주세요.',409);if(previous){await r.db.prepare('UPDATE angel_uploads SET status=\'deleted\' WHERE id=?').bind(previous.id).run().catch(()=>console.error('Old Angel upload cleanup pending'));await r.bucket.delete(previous.storage_key).catch(()=>console.error('Old Angel file cleanup pending'))}return json({saved:true});
 }catch(e){await r.bucket.delete(row.storage_key);await r.db.prepare('UPDATE angel_uploads SET status=\'failed\' WHERE id=? AND status=\'uploading\'').bind(row.id).run();throw e}
}
async function media(request:Request,r:ClassRuntime){
 const token=await readToken(new URL(request.url).searchParams.get('token')||'',r.secret,'play');if(!token)throw new ClassError('영상 링크가 만료됐어요. 목록을 새로고침해 주세요.',401);
 const row=await r.db.prepare('SELECT u.storage_key,u.content_type FROM angel_uploads u JOIN angel_submissions s ON s.upload_id=u.id AND s.done=1 JOIN angel_assignments a ON a.id=s.assignment_id AND a.archived=0 WHERE u.id=? AND u.status=\'ready\'').bind(token.id).first<{storage_key:string;content_type:string}>();if(!row)throw new ClassError('현재 제출된 영상이 아니에요.',404);
 const object=await r.bucket.get(row.storage_key,{range:request.headers});if(!object)throw new ClassError('영상을 찾지 못했어요.',404);
 const headers=new Headers({'Content-Type':row.content_type,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Accept-Ranges':'bytes','Referrer-Policy':'no-referrer','Content-Disposition':'inline'});headers.set('ETag',object.httpEtag);
 let status=200;if(object.range&&'offset' in object.range&&'length' in object.range&&typeof object.range.offset==='number'&&typeof object.range.length==='number'){status=206;headers.set('Content-Range',`bytes ${object.range.offset}-${object.range.offset+object.range.length-1}/${object.size}`);headers.set('Content-Length',String(object.range.length))}else headers.set('Content-Length',String(object.size));
 return new Response(request.method==='HEAD'?null:object.body,{status,headers});
}
export async function classRequest(request:Request,r:ClassRuntime,endpoint:string){
 let response:Response;const origin=request.headers.get('origin');
 if(request.method==='OPTIONS')response=new Response(null,{status:204});
 else try{
  if(endpoint!=='upload'&&Number(request.headers.get('content-length')||0)>16000)throw new ClassError('요청 내용이 너무 길어요.',413);
  if(!r.secret||!r.password||!r.db||!r.bucket)throw new ClassError('클래스 저장소 연결을 준비하고 있어요. 잠시 후 다시 시도해 주세요.',503);
  if(endpoint==='session'&&request.method==='POST')response=await sessionAction(request,r);
  else if(endpoint==='state'&&request.method==='GET')response=await state(request,r);
  else if(endpoint==='action'&&request.method==='POST')response=await action(request,r);
  else if(endpoint==='upload'&&request.method==='PUT')response=await upload(request,r);
  else if(endpoint==='media'&&['GET','HEAD'].includes(request.method))response=await media(request,r);
  else response=json({error:'지원하지 않는 요청이에요.'},405);
 }catch(e){if(!(e instanceof ClassError))console.error('Angel class request failed',e instanceof Error?e.message:'unknown');response=json({error:e instanceof ClassError?e.message:'저장하지 못했어요. 다시 시도해 주세요.'},e instanceof ClassError?e.status:503)}
 if(origin&&(allowed.has(origin)||origin===new URL(request.url).origin)){response.headers.set('Access-Control-Allow-Origin',origin);response.headers.set('Access-Control-Allow-Methods','GET, HEAD, POST, PUT, OPTIONS');response.headers.set('Access-Control-Allow-Headers','Content-Type');response.headers.set('Vary','Origin')}
 return response;
}
