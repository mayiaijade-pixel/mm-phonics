import assert from 'node:assert/strict';import fs from 'node:fs';import {randomUUID} from 'node:crypto';
const base=process.env.ANGEL_TEST_BASE||'http://localhost:8787';
assert.ok(new URL(base).hostname==='localhost'||new URL(base).hostname==='127.0.0.1','test data stays local');
const origin='http://localhost:3001',classPassword=process.env.ANGEL_TEST_PASSWORD||'local-class-test';
function client(){let cookie='';return{async request(endpoint,body,method=body?'POST':'GET',extra={}){const r=await fetch(base+'/api/angel-class/'+endpoint,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});const next=r.headers.getSetCookie().find(v=>v.startsWith('angel-class='));if(next)cookie=next.split(';')[0];return r},get cookie(){return cookie}}}
async function body(r,status=200){assert.equal(r.status,status,`Expected HTTP ${status}, got ${r.status}: `+(r.headers.get('content-type')?.includes('json')?await r.clone().text():r.headers.get('content-type')));return r.json()}
const teacher=client(),jihan=client(),oreum=client(),iseo=client(),anonymous=client();
assert.equal((await body(await anonymous.request('state'))).assignments.length,0);
await body(await anonymous.request('action',{action:'complete',assignmentId:randomUUID(),done:true}),401);
await body(await anonymous.request('session',{action:'login',password:'wrong'}),403);
for(const c of [teacher,jihan,oreum,iseo])await body(await c.request('session',{action:'login',password:classPassword}));
await body(await teacher.request('session',{action:'select',role:'teacher',password:'wrong'}),403);
await body(await teacher.request('session',{action:'select',role:'teacher',password:'teacher-local-test'}));
for(const [c,student]of [[jihan,'지한'],[oreum,'오름'],[iseo,'이서']])await body(await c.request('session',{action:'select',role:'student',student}));
const items=[{id:randomUUID(),title:'Story 읽는 영상 올리기',kind:'video'},{id:randomUUID(),title:'스피드파닉스2 Unit 1 워크북 완료하기',kind:'check'},{id:randomUUID(),title:'스피드파닉스2 Unit 1 본책 9페이지까지 완료하기',kind:'check'}];
await body(await jihan.request('action',{action:'publish',week:'nov-1',items}),403);
await body(await teacher.request('action',{action:'publish',week:'nov-1',items}));
assert.equal((await body(await oreum.request('state'))).assignments.length,3);
await body(await jihan.request('action',{action:'complete',assignmentId:items[0].id,done:true}),400);
await body(await jihan.request('action',{action:'complete',assignmentId:items[1].id,done:true}));
let state=await body(await teacher.request('state'));assert.equal(state.submissions.find(s=>s.assignmentId===items[1].id).student,'지한');
await body(await jihan.request('action',{action:'complete',assignmentId:items[1].id,done:false}));assert.equal((await body(await teacher.request('state'))).submissions.length,0);
await body(await jihan.request('action',{action:'complete',assignmentId:items[1].id,done:true}));
await body(await teacher.request('action',{action:'publish',week:'nov-1',items:items.map((i,index)=>index===1?{...i,kind:'video'}:i)}),409);
await body(await teacher.request('action',{action:'publish',week:'nov-2',items}),409);
await body(await jihan.request('action',{action:'upload-ticket',assignmentId:items[0].id,size:300_000_001,contentType:'video/mp4'}),400);
const video=fs.readFileSync('public/videos/unit1-story-v2.mp4');
async function upload(c,data=video,assignmentId=items[0].id){const ticket=await body(await c.request('action',{action:'upload-ticket',assignmentId,size:data.length,contentType:'video/mp4'}));const r=await fetch(ticket.url,{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:data});return{r,url:ticket.url}}
const bad=await upload(jihan,Buffer.alloc(300));await body(bad.r,415);
let file=await upload(jihan);await body(file.r);await body(await fetch(file.url,{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:video}),409);
state=await body(await teacher.request('state'));let submitted=state.submissions.find(s=>s.videoUrl);assert.equal(submitted.student,'지한');
const oldUrl=submitted.videoUrl;const part=await fetch(oldUrl,{headers:{Range:'bytes=0-127'}});assert.equal(part.status,206);assert.equal((await part.arrayBuffer()).byteLength,128);assert.equal(part.headers.get('content-range'),`bytes 0-127/${video.length}`);
await body(await fetch(oldUrl.slice(0,oldUrl.lastIndexOf('.')+1)+(oldUrl[oldUrl.lastIndexOf('.')+1]==='a'?'b':'a')+oldUrl.slice(oldUrl.lastIndexOf('.')+2)),401);
await body(await oreum.request('action',{action:'remove-video',assignmentId:items[0].id}));assert.ok((await body(await teacher.request('state'))).submissions.some(s=>s.student==='지한'&&s.videoUrl));
await body(await jihan.request('action',{action:'remove-video',assignmentId:items[0].id}));assert.equal((await fetch(oldUrl)).status,404);
file=await upload(jihan);await body(file.r);assert.ok((await body(await oreum.request('state'))).submissions.some(s=>s.student==='지한'&&s.videoUrl));
for(const item of items.slice(1))await body(await jihan.request('action',{action:'complete',assignmentId:item.id,done:true}));
state=await body(await teacher.request('state'));assert.equal(state.submissions.filter(s=>s.student==='지한'&&s.done).length,3);
// Two independent videos survive refresh; a third is rejected across all items in a week.
await body((await upload(jihan)).r);
state=await body(await teacher.request('state'));
let pair=state.submissions.filter(s=>s.student==='지한'&&s.videoUrl);assert.equal(pair.length,2);assert.notEqual(pair[0].videoId,pair[1].videoId);
await body(await jihan.request('action',{action:'upload-ticket',assignmentId:items[0].id,size:video.length,contentType:'video/mp4'}),409);
await body(await jihan.request('action',{action:'remove-video',assignmentId:items[0].id}),409);
await body(await oreum.request('action',{action:'remove-video',assignmentId:items[0].id,videoId:pair[0].videoId}));
assert.ok([200,206].includes((await fetch(pair[0].videoUrl)).status),'another student cannot delete this file');
await body(await jihan.request('action',{action:'remove-video',assignmentId:items[0].id,videoId:pair[0].videoId}));
assert.equal((await fetch(pair[0].videoUrl)).status,404);assert.ok([200,206].includes((await fetch(pair[1].videoUrl)).status),'deleting one keeps the other');
// Two tickets issued with one remaining slot cannot both finish successfully.
const tickets=await Promise.all([0,1].map(()=>jihan.request('action',{action:'upload-ticket',assignmentId:items[0].id,size:video.length,contentType:'video/mp4'}).then(r=>body(r))));
const finishes=await Promise.all(tickets.map(t=>fetch(t.url,{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:video})));
assert.deepEqual(finishes.map(r=>r.status).sort(),[200,409]);
assert.equal((await body(await teacher.request('state'))).submissions.filter(s=>s.student==='지한'&&s.videoUrl).length,2);
const otherItem={id:randomUUID(),title:'두 번째 영상 항목',kind:'video'};
await body(await teacher.request('action',{action:'publish',week:'nov-1',items:[...items,otherItem]}));
await body(await jihan.request('action',{action:'upload-ticket',assignmentId:otherItem.id,size:video.length,contentType:'video/mp4'}),409,'weekly limit spans assignment items');
const nextWeek={id:randomUUID(),title:'다음 주 영상',kind:'video'};
await body(await teacher.request('action',{action:'publish',week:'nov-2',items:[nextWeek]}));
await body((await upload(jihan,video,nextWeek.id)).r);
await body((await upload(oreum)).r);await body((await upload(oreum,video,otherItem.id)).r);
await body(await oreum.request('action',{action:'upload-ticket',assignmentId:items[0].id,size:video.length,contentType:'video/mp4'}),409);
state=await body(await teacher.request('state'));assert.equal(state.submissions.filter(s=>s.student==='지한'&&s.videoUrl).length,3,'new week has independent allowance');
console.log('PASS: two videos per student/week, independent playback/deletion, reupload, cross-item limit, peer isolation and concurrent completion limit');
// The application proxy uses the same backend and carries only the class cookie.
const proxied=await fetch(origin+'/api/angel-class/state',{headers:{Cookie:jihan.cookie}});assert.equal(proxied.status,200);assert.equal((await proxied.json()).session.student,'지한');
const cors=await fetch(base+'/api/angel-class/upload',{method:'OPTIONS',headers:{Origin:'https://mm-phonics.vercel.app','Access-Control-Request-Method':'PUT'}});assert.equal(cors.headers.get('access-control-allow-origin'),'https://mm-phonics.vercel.app');
const csrf=await jihan.request('action',{action:'complete',assignmentId:items[1].id,done:false},'POST',{Origin:'https://unrelated.example'});await body(csrf,403);
await body(await jihan.request('session',{action:'logout'}));assert.equal((await body(await jihan.request('state'))).session,null);
console.log('PASS: real isolated D1 + R2, shared proxy, password/teacher checks, teacher-only publishing, per-student completion/undo, 17MB video upload/play/range, invalid file, deletion/reupload, peer gallery, cookie tamper, CORS and CSRF');
