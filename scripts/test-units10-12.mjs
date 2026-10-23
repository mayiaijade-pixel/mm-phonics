import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(file,deps={}){const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}),{exports,require:n=>deps[n]||require(n),Buffer,URL,Request,Response,TextEncoder,TextDecoder,AbortSignal,setTimeout,clearTimeout,...deps.globals});return exports}
const blends=load('lib/blend-units.ts'),schema=load('lib/progress-schema.ts').progressSchema,clips=JSON.parse(fs.readFileSync('app/mimi-segments.json')),audio=JSON.parse(fs.readFileSync('app/corgi-audio.json')),targets=JSON.parse(fs.readFileSync('lib/pronunciation-targets.json'));
const letters=load('lib/intro-letters.ts'),Duo=load('app/tutor-duo.tsx',{'../lib/intro-letters':letters}).default,React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
for(const unit of [10,11,12]){
 const c=blends.BLEND_UNITS[unit];assert.equal(c.words.length,unit===12?8:9);assert.equal(c.hasMedia,false);assert.equal(c.families.length,unit===12?4:3);
 const html=renderToStaticMarkup(React.createElement(Duo,{intro:true,letterUnit:unit}));
 c.families.forEach((f,index)=>{assert.ok(html.includes(letters.blendLabel(letters.INTRO_LETTERS[unit][index],letters.RIGHT_LETTERS[unit][index])));const group=c.words.filter(w=>w.family===f);assert.equal(group.length,unit===12?2:3);for(const w of group)assert.ok(clips[`u${unit}-blend-${f}`][0].text.includes(w.word))});
 assert.deepEqual(clips[`u${unit}-0`].map(x=>x.speaker),['mimi','mimi','corgi','mimi']);
 for(const [i,w]of c.words.entries()){assert.ok(targets[w.word]);assert.ok(fs.statSync('public'+audio[w.word]).size>1000);assert.ok(clips[`u${unit}-4-${w.word}`].every(x=>x.speaker===((i+(unit===11?9:0))%2?'corgi':'mimi')))}
 for(const [key,lines]of Object.entries(clips))if(key.startsWith(`u${unit}-`))for(const clip of lines){assert.ok(fs.statSync('public'+clip.audio).size>1000);assert.equal(clip.text.split(/(?<=[.!?])\s+/).length,1)}
 assert.equal(c.questions.length,3);assert.equal(new Set(c.questions.flatMap(q=>q.choices)).size,6);for(const q of c.questions){assert.equal(q.choices.length,2);assert.ok(q.choices.includes(q.answer));q.choices.forEach(w=>assert.ok(c.words.some(v=>v.word===w)))}
}
const full={resetVersion:1,nameConfirmed:true,name:'가'.repeat(30),step:7,word:7,quiz:3,completed:true,homework:['book-unit1'],rewards:{}};
for(let unit=1;unit<=12;unit++){if(unit>1)full['unit'+unit]={step:7,word:unit>=8&&unit<=11?8:7,quiz:3,completed:true,homework:['book-unit'+unit]};full.rewards[unit]={stars:1000000,completions:1000000,awarded:true}}
assert.ok(schema.safeParse(full).success);assert.equal(schema.safeParse({...full,unit12:{...full.unit12,word:8}}).success,false);
const codec=load('lib/progress-cookie.ts');const encoded=codec.encodeProgress(full);assert.ok(Buffer.byteLength(encoded)+100<4096);assert.deepEqual(JSON.parse(JSON.stringify(codec.decodeProgress(encoded))),full);assert.deepEqual(JSON.parse(JSON.stringify(codec.decodeProgress(Buffer.from(JSON.stringify(full)).toString('base64url')))),full);
let cookie;const vc=load('platform/vercel/progress.ts',{'next/headers':{cookies:async()=>({get:()=>cookie?{value:cookie}:undefined,set:(name,value)=>cookie=value})},'../../lib/progress-schema':{progressSchema:schema},'../../lib/progress-cookie':codec});
const request=()=>new Request('http://localhost/api/progress',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify(full)});
assert.equal((await vc.POST(request())).status,200);assert.deepEqual((await(await vc.GET()).json()).progress,full);
let sql,bindings,row;const db={prepare(q){sql=q;return{bind(...b){bindings=b;return this},async run(){return{}},async first(){return row}}}};
const sites=load('platform/sites/progress.ts',{'../../lib/progress-schema':{progressSchema:schema},'../../db':{getDatabase:()=>db},'../../app/chatgpt-auth':{getChatGPTUser:async()=>({userId:'isolated-test'})}});
assert.equal((await sites.POST(request())).status,200);assert.equal((sql.match(/\?/g)||[]).length,bindings.length);for(const [u,i]of [[10,18],[11,19],[12,20]])assert.deepEqual(JSON.parse(bindings[i]),full['unit'+u]);
const sqliteCheck=execFileSync('python3',['-c',`import sqlite3,json,sys
v=json.load(sys.stdin);db=sqlite3.connect(':memory:')
db.execute('CREATE TABLE lesson_progress (user_id TEXT PRIMARY KEY, name TEXT, name_confirmed INTEGER, step INTEGER, word INTEGER, quiz INTEGER, completed INTEGER, homework TEXT, updated_at TEXT, '+', '.join('unit'+str(i)+' TEXT' for i in range(2,13))+', rewards TEXT)')
db.execute(v['sql'],v['bindings']);db.execute(v['sql'],v['bindings'])
row=db.execute('SELECT unit10,unit11,unit12,rewards FROM lesson_progress').fetchone()
assert all(json.loads(row[i])==v['progress']['unit'+str(i+10)] for i in range(3))
assert json.loads(row[3])==v['progress']['rewards']
`],{input:JSON.stringify({sql,bindings,progress:full})});
row={name:full.name,name_confirmed:1,step:7,word:7,quiz:3,completed:1,homework:JSON.stringify(full.homework),rewards:JSON.stringify(full.rewards),...Object.fromEntries(Array.from({length:11},(_,i)=>['unit'+(i+2),JSON.stringify(full['unit'+(i+2)])]))};assert.deepEqual((await(await sites.GET()).json()).progress.unit12,full.unit12);
const rewards=load('lib/lesson-rewards.ts');assert.equal(rewards.totalStars(full),12000000);
console.log('PASS: 26 words, per-card tutors, 10 blend families, sentence audio, two-choice quizzes, all 12 unit rewards, Sites SQL, compressed + legacy Vercel cookie roundtrip');
const motions=JSON.parse(fs.readFileSync('lib/new-word-motions.json'));assert.equal(Object.keys(motions).length,26);
for(const unit of [10,11,12])for(const [i,w]of blends.BLEND_UNITS[unit].words.entries()){
 const m=motions[w.word];assert.equal(m.unit,unit);assert.equal(m.actor,(i+(unit===11?9:0))%2?'Kogi':'Mimi');
 const png=fs.readFileSync(`public/images/unit${unit}/actions/${w.word}.png`);assert.equal(png.readUInt32BE(16),1536);assert.equal(png.readUInt32BE(20),1024);assert.ok(m.description);
}
console.log('PASS: all 26 six-frame animation PNGs, alternating characters and accessible scene labels');
