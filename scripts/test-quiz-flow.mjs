import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ts from 'typescript';
const src=fs.readFileSync('app/lesson.tsx','utf8');
const extract=(start,end)=>src.slice(src.indexOf(start),src.indexOf(end,src.indexOf(start)));
const code=ts.transpile(extract(' function cancelQuiz',' useEffect(()=>{\n  quizAnswered.current')+extract(' function selectAnswer',' const recordControls'),{target:ts.ScriptTarget.ES2022});
function setup(muted=false){
 const clips=[],timers=new Map();let serial=0,progress={quiz:0},praise,correct=false;
 const context={quizFlow:{current:0},quizTimer:{current:null},quizAnswered:{current:false},quizAutoplayPending:{current:false},playing:{current:null},mounted:{current:true},muted,p:{quiz:0},unitTwo:false,activeUnit:1,unitKey:"unit2",QUESTIONS:[{answer:'hose'},{answer:'pose'},{answer:'note'}],mimiAudio:{hose:'/hose-v2.mp3'},name:'Test',setSpeaking(){},setNotice(){},setQuizHeard(){},setAnswer(){},setCorrect(v){correct=v},setP(fn){progress=fn(progress)},setCourse(fn){progress=fn(progress)},stopAudio(){},speak(...args){praise=args},setTimeout(fn){timers.set(++serial,fn);return serial},clearTimeout(id){timers.delete(id)},Audio:class{constructor(source){this.source=source;clips.push(this)}play(){this.onplaying?.();return Promise.resolve()}}};
 vm.createContext(context);vm.runInContext(code,context);
 return {context,clips,get praise(){return praise},get progress(){return progress},get correct(){return correct},flush(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())}};
}
const a=setup();a.context.playQuizWord();assert.equal(a.clips.length,1);assert.equal(a.clips[0].source,'/hose-v2.mp3');a.clips[0].onended();a.flush();assert.equal(a.clips.length,2);a.clips[1].onended();a.flush();assert.equal(a.clips.length,2);
const b=setup();b.context.playQuizWord();b.clips[0].onended();b.context.selectAnswer('hose');b.flush();assert.equal(b.clips.length,1,'correct answer cancels pending second pronunciation');assert.equal(b.progress.quiz,0,'wait for praise to finish');assert.equal(b.correct,true);b.context.selectAnswer('hose');b.praise[2]();b.flush();assert.equal(b.progress.quiz,1);
const c=setup();c.context.selectAnswer('hose');c.praise[2]();c.context.cancelQuiz();c.flush();assert.equal(c.progress.quiz,0,'leaving page cancels pending advance');
const d=setup(true);d.context.playQuizWord();assert.equal(d.clips.length,0);d.context.selectAnswer('hose');d.flush();assert.equal(d.progress.quiz,1,'muted quiz still advances');
const e=setup();e.context.selectAnswer('hose');e.praise[3]();e.flush();assert.equal(e.progress.quiz,1,'failed praise audio does not strand learner');
console.log('PASS: twice-only playback, praise-before-advance, repeated taps, navigation cancellation, mute and audio failure');
