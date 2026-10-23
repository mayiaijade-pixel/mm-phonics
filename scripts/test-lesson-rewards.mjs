import assert from 'node:assert/strict';import ts from 'typescript';import vm from 'node:vm';import fs from 'node:fs';import {createRequire} from 'node:module';
const exports={};const context={exports};vm.createContext(context);vm.runInContext(ts.transpile(fs.readFileSync('lib/lesson-rewards.ts','utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}),context);
const {unitReward,totalStars,awardQuiz,replayUnit}=exports;
const initial={completed:false,step:0,quiz:0,name:'Test',unit6:{completed:false,step:5,quiz:2,homework:[]}};
let result=awardQuiz(initial,6,3);assert.equal(totalStars(result),3);assert.equal(unitReward(result,6).completions,1);assert.equal(result.unit6.completed,true);
result=awardQuiz(result,6,3);assert.equal(totalStars(result),3,'same run cannot be awarded twice');
result=JSON.parse(JSON.stringify(result));result=awardQuiz(result,6,3);assert.equal(totalStars(result),3,'reload cannot award twice');
result=replayUnit(result,6);assert.equal(result.unit6.quiz,0);assert.equal(result.unit6.step,0);assert.equal(totalStars(result),3,'replay preserves collection');
result=awardQuiz(result,6,3);assert.equal(totalStars(result),6);assert.equal(unitReward(result,6).completions,2);
result=awardQuiz(result,1,3);assert.equal(totalStars(result),9);assert.equal(result.completed,true);
assert.equal(totalStars({completed:true,unit6:{completed:true}}),6,'legacy completion gets one three-star award');
assert.equal(unitReward(awardQuiz(initial,6,2),6).stars,2,'one star per correct question');
const require=createRequire(import.meta.url);const schemaModule={exports:{}};vm.runInNewContext(ts.transpile(fs.readFileSync('lib/progress-schema.ts','utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}),{exports:schemaModule.exports,require});
const payload={resetVersion:1,nameConfirmed:true,name:'Test',step:0,word:0,quiz:0,completed:false,homework:[],rewards:result.rewards};
assert.equal(schemaModule.exports.progressSchema.safeParse(payload).success,true,'new reward collection is persisted by API schema');
assert.equal(schemaModule.exports.progressSchema.safeParse({...payload,rewards:undefined}).success,true,'old progress still loads');
for(const unit of [1,2,3,4,5,6,7]){const segments=JSON.parse(fs.readFileSync('app/mimi-segments.json','utf8')),prefix=unit===1?'':`u${unit}-`;assert.ok(!segments[prefix+'2-before'].some(s=>s.text.toLowerCase().includes('meets')));assert.ok(segments[prefix+'2'].some(s=>s.text.toLowerCase().includes('meets')))}
console.log('PASS: per-question stars, replay accumulation, duplicate/reload guard, legacy progress, persistence schema, before/after Magic e dialogue');
