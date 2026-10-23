import assert from 'node:assert/strict';import fs from 'node:fs';
for(const [unit,words] of [[8,['black','blue','block','clap','flap','flute']],[9,['slide','sled']]])for(const word of words){
 const file=`public/images/unit${unit}/actions/${word}.png`,png=fs.readFileSync(file);
 assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 assert.equal(width*2,height*3,`${word}: six square frames in 3×2 grid`);assert.ok(width>=1500);assert.ok(png.length>100000);
}
const source=fs.readFileSync('app/blend-picture.tsx','utf8'),css=fs.readFileSync('app/globals.css','utf8');
assert.match(source,/unit\$\{scene.unit\}\/actions\/\$\{word\}/);
assert.match(css,/word-action-frames[^}]*steps\(1,end\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.word-motion-window/);
console.log('PASS: eight real six-frame action assets, correct Unit paths and reduced-motion fallback');
