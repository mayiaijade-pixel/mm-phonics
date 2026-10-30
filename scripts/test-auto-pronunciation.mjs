import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync('app/lesson.tsx','utf8');
const endpointCode=ts.transpile(fs.readFileSync('lib/recording-endpoint.ts','utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022});
const endpoint={};vm.runInNewContext(endpointCode,{exports:endpoint});
const silent=endpoint.createSpeechEndpoint();for(let t=0;t<15000;t+=20)assert.equal(silent(0,t),false,'initial silence cannot end a recording');
const speech=endpoint.createSpeechEndpoint();for(let t=0;t<=200;t+=20)assert.equal(speech(.08,t),false);assert.equal(speech(0,900),false);assert.equal(speech(0,1200),true);
const pause=endpoint.createSpeechEndpoint();for(let t=0;t<=200;t+=20)pause(.04,t);assert.equal(pause(0,800),false);assert.equal(pause(.04,900),false);assert.equal(pause(0,1800),false);assert.equal(pause(0,1900),true,'speech restarts the silence deadline');
const noise=endpoint.createSpeechEndpoint();noise(.1,0);noise(.1,20);assert.equal(noise(0,1300),false,'one short click is not speech');
const functions=source.slice(source.indexOf(' async function startRecord()'),source.indexOf(' async function hearFeedback'))+source.slice(source.indexOf(' async function checkVoice()'),source.indexOf(' function listenRecording()'));
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve()};
function setup(){
 const state={requests:[],feedback:[],assessments:[],tracks:0,recording:false,checking:false};
 const ref=current=>({current});
 const stream={getTracks:()=>[{stop(){state.tracks++}}]};
 class Recorder{static latest;state='inactive';mimeType='audio/mp4';constructor(){Recorder.latest=this}start(){this.state='recording'}stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable({data:new Blob(['recorded speech'],{type:this.mimeType})});this.onstop()})}}
 const scope={console,navigator:{mediaDevices:{getUserMedia:async()=>stream}},window:{MediaRecorder:Recorder},MediaRecorder:Recorder,Blob,FormData,AbortController,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){},queueMicrotask,
  p:{step:3,word:0},WORDS:[{word:'bike'}],sound:'eye',longWord:'cape',activeUnit:3,checking:false,recorder:ref(null),stream:ref(null),recordEpoch:ref(0),recordShouldReview:ref(false),recordStarting:ref(false),recordMonitor:ref(null),recTimer:ref(null),recordTarget:ref(''),recordingBlob:ref(null),urlRef:ref(''),mounted:ref(true),assessmentAbort:ref(null),
  stopAudio(){},setStartingRecording(){},setAssessment:v=>state.assessments.push(v),setAssessmentError:v=>state.error=v,setPracticeDone:v=>state.practice=v,setRecording:v=>state.recording=v,setNotice(){},setAudioUrl(){},setChecking:v=>{state.checking=v;scope.checking=v},hearFeedback:v=>state.feedback.push(v),watchSpeechEnd:(_stream,end)=>{state.end=end;return()=>{}},fetch:async(_url,request)=>{state.requests.push(request);return {ok:true,json:async()=>({target:'eye',status:state.result||'match'})}}};
 vm.createContext(scope);vm.runInContext(ts.transpile(functions,{target:ts.ScriptTarget.ES2022}),scope);
 return {state,scope,Recorder,stream};
}
{
 const {scope:s,state}=setup();await s.startRecord();state.end();await flush();assert.equal(state.requests.length,1);assert.equal(state.requests[0].body.get('target'),'eye');assert.equal(state.requests[0].body.get('unit'),'3');assert.equal(state.assessments.at(-1).status,'match');assert.equal(state.practice,true);assert.equal(state.recording,false);assert.equal(state.checking,false);
}
{
 const {scope:s,state}=setup();state.result='retry';await s.startRecord();s.stopRecord();await flush();assert.equal(state.assessments.at(-1).status,'retry');assert.equal(state.practice,false);assert.equal(state.feedback.length,1);
}
{
 const {scope:s,state}=setup();await s.startRecord();s.stopRecord(false);await flush();assert.equal(state.requests.length,0,'navigation cannot submit audio');
}
{
 const {scope:s,state,stream}=setup();let permit;s.navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>permit=resolve);const pending=s.startRecord();s.stopRecord(false);permit(stream);await pending;assert.equal(s.recorder.current,null);assert.ok(state.tracks>0);assert.equal(state.requests.length,0);
}
{
 const {scope:s,state,Recorder}=setup();await s.startRecord();Recorder.latest.onerror();await flush();assert.equal(state.requests.length,0);assert.ok(state.error.includes('녹음이 중단'));
}
{
 const {scope:s,state}=setup();let response;s.fetch=()=>new Promise(resolve=>response=resolve);await s.startRecord();state.end();await flush();s.assessmentAbort.current.abort();s.recordEpoch.current++;response({ok:true,json:async()=>({target:'eye',status:'match'})});await flush();assert.equal(state.assessments.filter(Boolean).length,0,'late review must not open on another card');
}
assert.doesNotMatch(source,/onClick=\{checkVoice\}.*Review/);assert.match(source,/Listening… 발음을 확인하고 있어요/);assert.match(source,/\?'Good job!':'Try again!'/);
console.log('PASS: speech endpoint, automatic/manual review, retry feedback, canceled navigation/permission/error, stale responses and no Review step');
