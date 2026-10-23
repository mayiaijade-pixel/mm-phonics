import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
const require=createRequire(import.meta.url);
function load(file,dependencies={}){const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}),{exports,require:name=>dependencies[name]||require(name),TextEncoder,TextDecoder,Buffer,URL,Response,Request,AbortSignal,setTimeout,clearTimeout,...dependencies.globals});return exports}
const blends=load('lib/blend-units.ts'),segments=JSON.parse(fs.readFileSync('app/mimi-segments.json','utf8')),audio=JSON.parse(fs.readFileSync('app/corgi-audio.json','utf8'));
for(const unit of [8,9]){
 const config=blends.BLEND_UNITS[unit];assert.equal(config.words.length,9);assert.equal(config.hasMedia,false);assert.equal(new Set(config.questions.flatMap(q=>q.choices)).size,6);
 for(const w of config.words){assert.ok(fs.statSync('public'+audio[w.word]).size>1000);assert.equal(blends.blendWord(w.word).unit,unit)}
 for(const key of ['0','1','2','3','5','7','homework',...config.words.map(w=>'4-'+w.word)])for(const clip of segments[`u${unit}-${key}`]){assert.ok(fs.existsSync('public'+clip.audio));assert.ok(!clip.text.includes('magic e'));}
 assert.ok(fs.statSync(`public/images/unit${unit}/duo-word-atlas.png`).size>1000);
}
for(const unit of [8,9]){
 assert.deepEqual(segments[`u${unit}-0`].map(c=>c.speaker),['mimi','mimi','corgi','mimi']);
 for(const w of blends.BLEND_UNITS[unit].words)assert.deepEqual(segments[`u${unit}-4-${w.word}`].map(c=>c.speaker),['mimi','corgi']);
}
const schema=load('lib/progress-schema.ts').progressSchema;
const lesson={step:4,word:8,quiz:0,completed:false,homework:[]};const progress={resetVersion:1,nameConfirmed:true,name:'Test',step:0,word:0,quiz:0,completed:false,homework:[],unit8:lesson,unit9:lesson};assert.equal(schema.safeParse(progress).success,true);assert.equal(schema.safeParse({...progress,unit7:lesson}).success,false);
const rewards=load('lib/lesson-rewards.ts');let earned=rewards.awardQuiz(progress,8,3);earned=rewards.awardQuiz(earned,9,3);assert.equal(rewards.totalStars(earned),6);earned=rewards.awardQuiz(rewards.replayUnit(earned,8),8,3);assert.equal(rewards.totalStars(earned),9);assert.equal(earned.unit9.completed,true);
const calls=[];const dependencies={'../../lib/blend-units':blends,'../../lib/voice-text':{letterNamesForSpeech:s=>s,letterNamesWithPhonemes:s=>s},'../../app/corgi-audio.json':audio,'../../app/mimi-segments.json':segments,'../../app/mimi-audio.json':JSON.parse(fs.readFileSync('app/mimi-audio.json','utf8')),'./auth':{getChatGPTUser:async()=>({userId:'test'})},globals:{process:{env:{ELEVENLABS_API_KEY:'test-only-placeholder',ELEVENLABS_VOICE_ID:'mimi-test-voice'}},fetch:async(url,opts)=>{calls.push({url,body:JSON.parse(opts.body)});return new Response(new Uint8Array(1200))}}};
const api=load('platform/vercel/mimi-voice.ts',dependencies);
async function voice(body){const r=await api.POST(new Request('http://localhost/api/mimi-voice',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(r.status,200)}
await voice({scene:'u8-0',index:0,name:'Alice',unit:8});assert.ok(calls.at(-1).url.includes('mimi-test-voice'));assert.equal(calls.at(-1).body.text,'Hi, Alice!');
await voice({scene:'u9-0',index:2,name:'Alice',unit:9});assert.ok(calls.at(-1).url.includes(blends.CORGI_VOICE_ID));assert.equal(calls.at(-1).body.text,"I'm Kogi!");
await voice({scene:'u8-0',index:1,name:'Alice',unit:8});assert.ok(calls.at(-1).url.includes('mimi-test-voice'));assert.equal(calls.at(-1).body.text,"I'm Mimi!");
await voice({scene:'u9-0',index:3,name:'Alice',unit:9});assert.ok(calls.at(-1).url.includes('mimi-test-voice'));
await voice({scene:'u8-4-black',index:1,name:'Alice',unit:8});assert.ok(calls.at(-1).url.includes(blends.CORGI_VOICE_ID));
await voice({scene:'u7-0',index:0,name:'Alice7',unit:7});assert.ok(calls.at(-1).url.includes('mimi-test-voice'));
await voice({text:'Yes, Alice! You found it! Great job!',name:'Alice',unit:8});assert.ok(calls.at(-1).url.includes(blends.CORGI_VOICE_ID));
await voice({scene:'corgi-feedback-success',name:'Alice',unit:9});assert.ok(calls.at(-1).url.includes(blends.CORGI_VOICE_ID));
console.log('PASS: 18 word assets, 9-card progress, Unit 8/9 reward persistence, personalized Mimi + Kogi greeting and per-line voices and unchanged Mimi voice');

let sql='',bindings=[],row=null;const db={prepare(query){sql=query;return {bind(...values){bindings=values;return this},async run(){return {meta:{changes:1}}},async first(){return row}}}};
const sites=load('platform/sites/progress.ts',{'../../lib/progress-schema':{progressSchema:schema},'../../db':{getDatabase:()=>db},'../../app/chatgpt-auth':{getChatGPTUser:async()=>({userId:'isolated-test'})}});
const saved=await sites.POST(new Request('http://localhost/api/progress',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify(progress)}));assert.equal(saved.status,200);assert.equal((sql.match(/\?/g)||[]).length,bindings.length);assert.deepEqual(JSON.parse(bindings[15]),lesson);assert.deepEqual(JSON.parse(bindings[16]),lesson);
row={name:'Test',name_confirmed:1,step:0,word:0,quiz:0,completed:0,homework:'[]',unit8:JSON.stringify(lesson),unit9:JSON.stringify(lesson)};const restored=await (await sites.GET()).json();assert.equal(restored.progress.unit8.word,8);assert.equal(restored.progress.unit9.word,8);
const full={...progress,name:'가'.repeat(30)};for(let unit=2;unit<=9;unit++)full['unit'+unit]={...lesson,word:unit>=8?8:7,completed:true,homework:['book-unit'+unit]};full.rewards=Object.fromEntries(Array.from({length:9},(_,i)=>[String(i+1),{stars:300,completions:100,awarded:true}]));assert.ok(Buffer.byteLength(Buffer.from(JSON.stringify(schema.parse(full))).toString('base64url'))<4000,'nine units fit the Vercel progress cookie');
console.log('PASS: Sites Unit 8/9 SQL bindings and restore, and full-course Vercel cookie capacity');

// Sites must choose the same trusted line speaker as Vercel, including personalized names.
const voiceDb={prepare(){return {bind(){return this},async first(){return null},async run(){return {meta:{changes:1}}}}}};
const sitesVoice=load('platform/sites/mimi-voice.ts',{...dependencies,'cloudflare:workers':{env:{ELEVENLABS_API_KEY:'test-only-placeholder',ELEVENLABS_VOICE_ID:'mimi-test-voice'}},'../../app/chatgpt-auth':{getChatGPTUser:async()=>({userId:'isolated-voice-test'})},'../../db':{getDatabase:()=>voiceDb},globals:{...dependencies.globals,crypto:webcrypto,btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')}});
for(const unit of [8,9])for(const [index,speaker] of [[0,'mimi'],[1,'mimi'],[2,'corgi'],[3,'mimi']]){
 const r=await sitesVoice.POST(new Request('http://localhost/api/mimi-voice',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({scene:`u${unit}-0`,index,name:'Lody',unit})}));
 assert.equal(r.status,200);assert.ok(calls.at(-1).url.includes(speaker==='mimi'?'mimi-test-voice':blends.CORGI_VOICE_ID));
}
console.log('PASS: Sites personalizes each greeting line with the correct Mimi/Kogi voice');
for(const unit of [10,11,12]){
 const fresh=load('platform/vercel/mimi-voice.ts',dependencies);
 const freshVoice=async body=>{const r=await fresh.POST(new Request('http://localhost/api/mimi-voice',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(r.status,200)};
 await freshVoice({scene:`u${unit}-0`,index:0,name:`Learner${unit}`,unit});assert.ok(calls.at(-1).url.includes('mimi-test-voice'));
 await freshVoice({scene:`u${unit}-0`,index:2,name:`Learner${unit}`,unit});assert.ok(calls.at(-1).url.includes(blends.CORGI_VOICE_ID));
 const first=blends.BLEND_UNITS[unit].words[0].word;
 await freshVoice({scene:`u${unit}-4-${first}`,index:0,name:`Learner${unit}`,unit});assert.ok(calls.at(-1).url.includes(unit===11?blends.CORGI_VOICE_ID:'mimi-test-voice'));
}
console.log('PASS: Unit 10–12 personalized introductions and first-card voice match');
