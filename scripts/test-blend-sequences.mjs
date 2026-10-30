import assert from 'node:assert/strict';
import fs from 'node:fs';
const segments=JSON.parse(fs.readFileSync('app/mimi-segments.json','utf8'));
const words=JSON.parse(fs.readFileSync('app/corgi-audio.json','utf8'));
const mobile=JSON.parse(fs.readFileSync('app/tutor-mobile-audio.json','utf8'));
const reminder='Keep both beginning sounds together!';
let groups=0;
for(const unit of [8,9,10,11,12]){
 const intro=segments[`u${unit}-2`],position=intro.findIndex(s=>s.text==='Blend them smoothly!');
 assert.equal(intro[position+1].text,reminder);assert.equal(intro[position+1].speaker,'corgi');
 const unitLines=Object.entries(segments).filter(([key])=>key.startsWith(`u${unit}-`)).flatMap(([,lines])=>lines);
 assert.equal(unitLines.filter(s=>s.text===reminder).length,1,'the reminder is only in the initial explanation');
 for(const [key,lines]of Object.entries(segments).filter(([key])=>key.startsWith(`u${unit}-blend-`))){
  groups++;assert.ok(lines.length>=2);
  for(const line of lines){const word=line.text.replace(/\.$/,'');assert.equal(line.audio,words[word]);assert.equal(line.speaker,'corgi');assert.equal(line.pauseAfterMs,700);assert.ok(fs.statSync('public'+mobile['corgi:'+line.audio]).size>1000)}
 }
}
assert.equal(groups,16);
assert.deepEqual(segments['u12-blend-sn'].map(s=>s.text),['snack.','snake.']);
const lesson=fs.readFileSync('app/lesson.tsx','utf8');assert.match(lesson,/sentence\.pauseAfterMs\?\?tutorGap/);assert.match(lesson,/generation!==audioGeneration\.current/);
console.log('PASS: 5 explanations each remind once; 16 groups use separate words with explicit 700ms pauses; native prepared audio retained');
