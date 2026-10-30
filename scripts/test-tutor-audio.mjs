import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),exports={};
class AudioMock{constructor(source){this.src=source;this.listeners={};this.currentTime=0;this.duration=30;this.paused=false;this.ended=false}addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}play(){this.paused=false;for(const fn of this.listeners.play||[])fn();return Promise.resolve()}pause(){this.paused=true;for(const fn of this.listeners.pause||[])fn()}}
vm.runInNewContext(ts.transpile(fs.readFileSync('lib/tutor-audio.ts','utf8'),{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}),{exports,require,Audio:AudioMock,requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
const {createTutorAudio,registerTutorBlob,tutorRate,tutorGap,timingFromSamples,pauseSeek}=exports;
assert.equal(tutorRate(true),.8);assert.equal(tutorRate(false),.9);assert.equal(tutorGap(120),108);assert.equal(tutorGap(180),162);assert.equal(tutorGap(450),405);
for(const corgi of [false,true]){const audio=createTutorAudio('/test',corgi);assert.equal(audio.playbackRate,corgi?.8:.9);assert.equal(audio.defaultPlaybackRate,audio.playbackRate);assert.equal(audio.preservesPitch,true);assert.equal(audio.webkitPreservesPitch,true)}
const samples=new Float32Array(1800);samples.fill(.1,200,500);samples.fill(.1,1100,1500);samples.fill(.002,1500,1600);
const timing=timingFromSamples(samples,1000);assert.ok(Math.abs(timing.start-.14)<.001);assert.ok(timing.pauses.length>=1);
assert.equal(pauseSeek(.25,timing,.8),null,'voiced speech cannot be skipped');assert.equal(pauseSeek(.45,timing,.9),null,'final consonants are preserved');
for(const rate of [.8,.9]){const [start,end]=timing.pauses[0],jumpAt=start+(end-start)*rate*.9;assert.equal(pauseSeek(jumpAt+.001,timing,rate),end);assert.ok(Math.abs((jumpAt-start)/rate-(end-start)*.9)<1e-9,'slower speech still produces 10% shorter pauses')}
assert.equal(timingFromSamples(new Float32Array(500),1000),null);
const profiles=JSON.parse(fs.readFileSync('app/tutor-timing.json','utf8'));assert.ok(Object.keys(profiles).length>300);for(const [source,t]of Object.entries(profiles)){assert.ok(fs.existsSync('public'+source));for(const [a,b]of t.pauses)assert.ok(a>=0&&b>a)}
const lesson=fs.readFileSync('app/lesson.tsx','utf8');assert.ok(lesson.includes('function listenRecording(){stopAudio();const a=new Audio(audioUrl)'),'student recordings keep their original speed');
console.log('PASS: Kogi 80%, Mimi 90%, pitch preservation, 10% shorter silence/gaps, protected consonants, leading silence and unchanged student recording speed');

// Blend narration, words, and personalized greetings bypass browser time stretching.
const mobile=JSON.parse(fs.readFileSync('app/tutor-mobile-audio.json','utf8'));
const segments=JSON.parse(fs.readFileSync('app/mimi-segments.json','utf8'));
for(const unit of [8,9])for(const line of segments[`u${unit}-0`]){
 const corgi=line.speaker==='corgi',audio=createTutorAudio(line.audio,corgi);
 assert.equal(audio.src,mobile[(corgi?'corgi:':'mimi:')+line.audio]);
 assert.equal(audio.playbackRate,1);assert.ok(!audio.listeners.loadedmetadata,'prepared audio must not seek repeatedly');
}
for(const [key,path]of Object.entries(mobile)){assert.ok(fs.statSync('public'+path).size>1000);const audio=createTutorAudio(key.replace(/^(mimi|corgi):/,''),key.startsWith('corgi:'));assert.equal(audio.playbackRate,1)}
await registerTutorBlob('blob:personalized',{},true);assert.equal(createTutorAudio('blob:personalized',false).playbackRate,1);
const first=createTutorAudio('/first',true),second=createTutorAudio('/second',false);await first.play();await second.play();assert.ok(first.paused);assert.ok(!second.paused);
// A late native play event from an old request must not restart the old clip.
first.paused=false;for(const fn of first.listeners.play)fn();assert.ok(first.paused);assert.ok(!second.paused);
console.log('PASS: prepared blend voices and personalized names play at 1x; only one tutor clip can own playback');
