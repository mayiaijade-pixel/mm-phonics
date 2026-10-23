import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('app/lesson.tsx','utf8');
const sceneExpression=source.match(/const sceneWord=(.*);/)[1];
const sceneWord=new Function('tab','p','corgi','shortWord','longWord','WORDS','blendIndex','magic',`return ${sceneExpression}`);
for(const [short,long] of [['black','blue'],['glass','glue']])assert.equal(sceneWord('lesson',{step:3},true,short,long,[],0,false),short);
assert.equal(sceneWord('lesson',{step:3},false,'cap','cape',[],0,false),'cape');
assert.match(source,/className="lesson-menu-button" onClick=\{\(\)=>switchTab\('lesson-menu'\)\}/);
assert.match(source,/onMenu=\{\(\)=>switchTab\('lesson-menu'\)\}/);
const menu=source.slice(source.indexOf("{tab==='lesson-menu'&&"),source.indexOf("{tab==='progress'&&"));
const progress=source.slice(source.indexOf("{tab==='progress'&&"));
assert.match(menu,/className="lesson-list"/);
assert.doesNotMatch(menu,/star-collection|RewardGoals/);
assert.doesNotMatch(progress,/className="lesson-list"/);
assert.match(progress,/star-collection/);
const clips=JSON.parse(readFileSync('app/mimi-segments.json','utf8'));
for(const [key,lines] of Object.entries(clips))if(/^u[89]-/.test(key))for(const {text,audio} of lines){assert.equal(text.split(/(?<=[.!?])\s+/).length,1,`${key}: ${text}`);assert.ok(readFileSync('public'+audio).length>1000)}
assert.deepEqual(clips['u8-0'].slice(2).map(x=>x.text),['Two letters, two sounds!','We can blend them together!']);
console.log('Practice word consistency, separate lesson menu, and sentence captions passed.');
