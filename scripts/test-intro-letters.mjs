import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(file,deps={}){const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}),{exports,require:n=>deps[n]||require(n)});return exports}
const data=load('lib/intro-letters.ts'),Duo=load('app/tutor-duo.tsx',{'../lib/intro-letters':data}).default;
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
assert.deepEqual(Array.from(data.INTRO_LETTERS[8]),['B','C','F']);assert.deepEqual(Array.from(data.INTRO_LETTERS[9]),['G','P','S']);
assert.equal(data.blendLabel('P'),'P + L → pl');
for(const [unit,letter] of [[8,'B'],[9,'G']]){const html=renderToStaticMarkup(React.createElement(Duo,{intro:true,letterUnit:unit}));assert.ok(html.includes(`대문자 ${letter}를 들고 있는 미미`));assert.ok(html.includes('대문자 L을 들고 있는 코기'));for(const l of data.INTRO_LETTERS[unit])assert.ok(html.includes(data.blendLabel(l)));}
const waiting=renderToStaticMarkup(React.createElement(Duo,{intro:true,letterUnit:8,joined:false}));assert.ok(waiting.includes('duo-waiting'));assert.equal((waiting.match(/disabled=""/g)||[]).length,3);
const normal=renderToStaticMarkup(React.createElement(Duo,{}));assert.ok(!normal.includes('mimi-letter-atlas'));assert.ok(normal.includes('/images/mimi.png'));
const src=fs.readFileSync('app/tutor-duo.tsx','utf8');assert.match(src,/clearInterval\(timer\)/);assert.match(src,/prefers-reduced-motion/);assert.match(src,/setChosen\(true\)/);
console.log('PASS: Unit-specific uppercase props, lowercase blend labels, hidden/disabled pre-entry choices, unchanged other scenes and timer cleanup');
