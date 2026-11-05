import assert from 'node:assert/strict';import fs from 'node:fs';import{randomUUID}from'node:crypto';
const base=process.env.ANGEL_TEST_BASE||'http://localhost:8787',origin='http://localhost:3001';assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname),'fixtures remain local');
function client(){let cookie='';return async(endpoint,body)=>{const r=await fetch(base+'/api/angel-class/'+endpoint,{method:body?'POST':'GET',headers:{Origin:origin,Cookie:cookie,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const c=r.headers.getSetCookie().find(c=>c.startsWith('angel-class='));if(c)cookie=c.split(';')[0];return r}}
async function json(r,status=200){assert.equal(r.status,status,r.headers.get('content-type')?.includes('video')?'media response':(await r.clone().text()).slice(0,1200));return r.json()}
const teacher=client(),student=client(),other=client();for(const c of[teacher,student,other])await json(await c('session',{action:'login',password:'local-class-test'}));
await json(await teacher('session',{action:'select',role:'teacher',password:'teacher-local-test'}));await json(await student('session',{action:'select',role:'student',student:'이서'}));await json(await other('session',{action:'select',role:'student',student:'오름'}));
const assignmentId=randomUUID();await json(await teacher('action',{action:'publish',week:'nov-4',items:[{id:assignmentId,title:'300MB local-only test',kind:'video'}]}));
const size=300_000_000;
await json(await student('action',{action:'upload-ticket',assignmentId,size:size+1,contentType:'video/mp4'}),400);
const ticket=await json(await student('action',{action:'upload-ticket',assignmentId,size,contentType:'video/mp4'}));assert.equal(ticket.partSize,10*1024*1024);assert.ok(ticket.token);
// A real playable MP4 padded with a valid free atom to exactly 300,000,000 bytes.
const original=fs.readFileSync('public/videos/unit1-story-v2.mp4');
const parts=[];
for(let offset=0;offset<size;offset+=ticket.partSize){
 const chunk=Buffer.alloc(Math.min(ticket.partSize,size-offset));
 const originalEnd=Math.min(original.length,offset+chunk.length);if(offset<originalEnd)original.copy(chunk,0,offset,originalEnd);
 const pad=Buffer.alloc(8);pad.writeUInt32BE(size-original.length);pad.write('free',4);
 for(let j=0;j<8;j++){const at=original.length+j-offset;if(at>=0&&at<chunk.length)chunk[at]=pad[j]}
 if(!offset){
  await json(await fetch(ticket.url+'&partNumber=0',{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:chunk.subarray(0,1000)}),400);
  await json(await fetch(ticket.url+'&partNumber=1',{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:chunk.subarray(0,1000)}),400);
 }
 const part=await json(await fetch(ticket.url+'&partNumber='+(parts.length+1),{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:chunk}));parts.push(part);
}
const complete={action:'complete-upload',assignmentId,token:ticket.token,parts};
await json(await other('action',complete),409);
await json(await student('action',{...complete,parts:parts.slice(1)}),400);
await json(await student('action',complete));await json(await student('action',complete),409);
let state=await json(await student('state'));const video=state.submissions.find(s=>s.assignmentId===assignmentId&&s.videoUrl);assert.ok(video);
const head=await fetch(video.videoUrl,{method:'HEAD'});assert.ok([200,206].includes(head.status));assert.equal(Number(head.headers.get('content-length')),size);
const first=await fetch(video.videoUrl,{headers:{Range:'bytes=0-127'}});assert.equal(first.status,206);assert.deepEqual(Buffer.from(await first.arrayBuffer()),original.subarray(0,128));
const cancelled=await json(await student('action',{action:'upload-ticket',assignmentId,size:100_000_000,contentType:'video/mp4'}));
await json(await student('action',{action:'abort-upload',assignmentId,token:cancelled.token}));
await json(await fetch(cancelled.url+'&partNumber=1',{method:'PUT',headers:{Origin:origin,'Content-Type':'video/mp4'},body:Buffer.alloc(1000)}),409);
state=await json(await student('state'));assert.equal(state.submissions.filter(s=>s.assignmentId===assignmentId&&s.videoUrl).length,1);
console.log('PASS: exactly 300MB accepted in 29 chunks, 300MB+1 rejected, part size/index validated, owner-only complete, missing parts/replay rejected, final size/range bytes match, abort leaves existing submission intact');
