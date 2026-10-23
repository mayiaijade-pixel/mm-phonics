import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync('lib/lesson-guidance.ts','utf8'),{module:ts.ModuleKind.CommonJS}),{exports});const ready=exports.nextLessonReady;
for(const step of [0,1,2,4]){assert.equal(ready(step,false,false,true,true,0),false);assert.equal(ready(step,true,false,true,true,0),true)}
assert.equal(ready(3,true,false,false,false,0),false,'narration alone cannot skip Say it');
assert.equal(ready(3,true,true,false,false,0),true);
assert.equal(ready(2,true,false,false,false,0),false,'Magic e needs an actual tap');
assert.equal(ready(2,true,false,true,false,0),true);
assert.equal(ready(5,true,false,false,false,2),false);assert.equal(ready(5,true,false,false,false,3),true);
const src=fs.readFileSync('app/lesson.tsx','utf8');
assert.match(src,/if\(index>=clips.length\)\{setSpeaking\(false\);setNarrationDone\(true\)/);
assert.match(src,/nextReady&&!speaking\?'guided-glow'/);
assert.match(src,/disabled=\{!nextReady\|\|recording\}/);
console.log('PASS: narration-to-Next cue, activity gating, mute/error escape and quiz completion');
// Drive actual narration callbacks: no pulse between sentences or after leaving a scene.
const lesson=fs.readFileSync('app/lesson.tsx','utf8');
const playback=ts.transpile(lesson.slice(lesson.indexOf(' function playGreeting('),lesson.indexOf(' useEffect(()=>{',lesson.indexOf(' function playGreeting('))),{target:ts.ScriptTarget.ES2022});
function player(muted=false){let done=false;const audios=[],timers=[];const ctx={muted,corgi:false,p:{step:0,name:'Jenny'},tab:'lesson',unitTwo:false,tutorKorean:'미미',sceneKey:'0',sentenceClips:[{text:'Hi, Jenny!',audio:'/first.mp3'},{text:"I'm Mimi!",audio:'/second.mp3'}],audioGeneration:{current:0},mounted:{current:true},greetingAudio:{current:null},playing:{current:null},greetingPending:{current:false},stopAudio(){ctx.audioGeneration.current++},setNotice(){},setSpokenCaption(){},setGreetingLine(){},setActiveSpeaker(){},setKogiJoined(){},setNarrationDone(v){done=v},setSpeaking(){},tutorGap:x=>x,setTimeout(fn){timers.push(fn)},createTutorAudio(){const a={play(){this.onplaying?.();return Promise.resolve()}};audios.push(a);return a}};vm.createContext(ctx);vm.runInContext(playback,ctx);return {ctx,audios,get done(){return done},flush(){timers.splice(0).forEach(fn=>fn())}}}
const guide=player();guide.ctx.playGreeting();assert.equal(guide.done,false);guide.audios[0].onended();guide.flush();assert.equal(guide.done,false);guide.audios[1].onended();guide.flush();assert.equal(guide.done,true);
const stale=player();stale.ctx.playGreeting();stale.audios[0].onended();stale.ctx.stopAudio();stale.flush();assert.equal(stale.done,false);assert.equal(stale.audios.length,1);
const silent=player(true);silent.ctx.playGreeting();assert.equal(silent.done,true);assert.equal(silent.audios.length,0);
const failed=player();failed.ctx.playGreeting();failed.audios[0].onerror();assert.equal(failed.done,true);
console.log('PASS: Start lesson waits for the final line, canceled narration cannot activate next scene, mute/error never strand learner');
