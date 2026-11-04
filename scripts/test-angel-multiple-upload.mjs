import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('app/angel-class.tsx','utf8');
const start=source.indexOf(' async function sendVideos('),end=source.indexOf('\n const videos=',start);
assert.ok(start>0&&end>start);
const code=ts.transpileModule(source.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
function harness({existing=0,failAt=0,cancelAt=0}={}){
 const values={error:'',notice:'',busy:false,progress:null},sent=[],tickets=[];
 const alive={current:true},xhr={current:null},uploadBatch={current:null};let saved=existing,maxActive=0,active=0,refreshes=0,actions;
 const deps={MAX_WEEKLY_VIDEOS:2,MAX_VIDEO_BYTES:80*1024*1024,weekVideos:Array(existing).fill({}),uploadBatch,alive,xhr,
 setError:v=>values.error=v,setNotice:v=>values.notice=v,setBusy:v=>values.busy=v,setUploading:v=>values.progress=v,
 refresh:async()=>{refreshes++;values.error=''},api:async(_endpoint,body)=>{tickets.push(body);return{url:'http://test/'+tickets.length}},
 XMLHttpRequest:class{upload={};status=200;responseText='';open(){}setRequestHeader(){}send(file){sent.push(file.name);active++;maxActive=Math.max(maxActive,active);queueMicrotask(()=>{active--;if(cancelAt===sent.length){actions.cancelUploads();return}if(failAt===sent.length){this.status=503;this.responseText=JSON.stringify({error:'test upload failed'})}else saved++;this.onload()})}abort(){this.onabort?.()}}
 };
 actions=new Function('deps',`const {${Object.keys(deps).join(',')}}=deps;${code};return {sendVideos,cancelUploads}`)(deps);
 return {...actions,values,sent,tickets,get saved(){return saved},get maxActive(){return maxActive},get refreshes(){return refreshes}};
}
const file=name=>({name,type:'video/mp4',size:1024}),item={id:'test-item'};
let h=harness();await h.sendVideos(item,[file('first.mp4'),file('second.mp4')]);assert.deepEqual(h.sent,['first.mp4','second.mp4']);assert.equal(h.saved,2);assert.equal(h.maxActive,1);assert.match(h.values.notice,/2\/2/);assert.equal(h.values.busy,false);
h=harness({existing:1});await h.sendVideos(item,[file('first.mp4'),file('second.mp4')]);assert.equal(h.sent.length,0);assert.match(h.values.error,/1개만/);await h.sendVideos(item,[file('second.mp4')]);assert.equal(h.saved,2);
h=harness();await h.sendVideos(item,[file('first.mp4'),{...file('bad.mp4'),size:81*1024*1024}]);assert.equal(h.sent.length,0);assert.match(h.values.error,/bad.mp4/);
h=harness({failAt:2});await h.sendVideos(item,[file('first.mp4'),file('second.mp4')]);assert.equal(h.saved,1);assert.match(h.values.notice,/1\/2/);assert.equal(h.values.error,'test upload failed');assert.equal(h.values.busy,false);
h=harness({cancelAt:1});await h.sendVideos(item,[file('first.mp4'),file('second.mp4')]);assert.deepEqual(h.sent,['first.mp4']);assert.equal(h.saved,0);assert.match(h.values.error,/취소/);assert.equal(h.values.busy,false);
assert.match(source,/<input[^>]*type="file" multiple/);assert.match(source,/Array\.from\(e\.target\.files\|\|\[\]\)/);
console.log('PASS: real upload handler accepts two files, uploads sequentially, validates remaining slots/all files first, preserves partial success and cancels the remaining queue');
