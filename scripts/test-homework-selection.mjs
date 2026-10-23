import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync('app/lesson.tsx','utf8');
const code=source.slice(source.indexOf(' function requestHomework('),source.indexOf(' const starCount'));
function setup(overrides={}){
 const state={approvalUnit:1,open:false,tab:'homework-all',notice:'',sent:null};
 const context={activeUnit:1,parentReady:true,parent:{approved:[],configured:true},setNotice:v=>state.notice=v,switchTab:v=>state.tab=v,setApprovalUnit:v=>{state.approvalUnit=v;context.approvalUnit=v},setApprovalPassword(){},setApprovalError(){},setApprovalOpen:v=>state.open=v,setApprovalBusy(){},approvalPassword:'test-only',approvalUnit:1,saveParent:async body=>state.sent=body,...overrides};
 vm.createContext(context);vm.runInContext(ts.transpile(code,{target:ts.ScriptTarget.ES2022}),context);return {state,context};
}
const test=setup();test.context.requestHomework(6);assert.equal(test.state.approvalUnit,6);assert.equal(test.context.activeUnit,1,'checking another homework must preserve current lesson');assert.equal(test.state.open,true);await test.context.approveHomework({preventDefault(){}});assert.equal(test.state.sent.unit,6,'approval is sent for the selected homework, not the last lesson');
const current=setup();current.context.requestHomework();assert.equal(current.state.approvalUnit,1);
const done=setup({parent:{approved:[6],configured:true}});done.context.requestHomework(6);assert.equal(done.state.open,false);assert.ok(done.state.notice);
const missing=setup({parent:{approved:[],configured:false}});missing.context.requestHomework(6);assert.equal(missing.state.tab,'my-page');assert.equal(missing.state.open,false);
const waiting=setup({parentReady:false});waiting.context.requestHomework(6);assert.equal(waiting.state.open,false);
console.log('PASS: selected-unit approval, current-lesson preservation, completed guard, password setup navigation and loading guard');
