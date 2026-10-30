import assert from 'node:assert/strict';
import fs from 'node:fs';
const segments=JSON.parse(fs.readFileSync('app/mimi-segments.json','utf8'));
const sounds=JSON.parse(fs.readFileSync('app/blend-sounds.json','utf8'));
const words=JSON.parse(fs.readFileSync('app/corgi-audio.json','utf8'));
const mobile=JSON.parse(fs.readFileSync('app/tutor-mobile-audio.json','utf8'));
const reminder='Keep both beginning sounds together!';
const expected={8:{bl:'black',cl:'clap',fl:'flag'},9:{gl:'glass',pl:'plane',sl:'sled'},10:{br:'brave',cr:'crab',fr:'frame'},11:{dr:'dragon',pr:'press',tr:'track'},12:{sm:'smell',sn:'snack',st:'stone',sw:'swan'}};
let groups=0;
for(const unit of [8,9,10,11,12]){
 const intro=segments[`u${unit}-2`],position=intro.findIndex(s=>s.text==='Blend them smoothly!');
 assert.equal(intro[position+1].text,reminder);assert.equal(intro[position+1].speaker,'corgi');
 const unitLines=Object.entries(segments).filter(([key])=>key.startsWith(`u${unit}-`)).flatMap(([,lines])=>lines);
 assert.equal(unitLines.filter(s=>s.text===reminder).length,1);
 for(const [family,word]of Object.entries(expected[unit])){
  groups++;const lines=segments[`u${unit}-blend-${family}`];assert.equal(lines.length,3);
  assert.deepEqual(lines.map(s=>s.text),[sounds[family].ipa,sounds[family].ipa,word+'.']);
  for(const [index,line]of lines.entries()){
   assert.equal(line.speaker,'corgi');
   assert.equal(line.pauseAfterMs,[400,600,0][index]);
   const path=index<2?line.audio:mobile['corgi:'+line.audio];assert.ok(fs.statSync('public'+path).size>1000);
   if(index<2){assert.equal(line.nativePlayback,true);assert.equal(line.audio,sounds[family].audio)}else assert.equal(line.audio,words[word]);
  }
 }
 const first=Object.keys(expected[unit])[0];assert.deepEqual(intro.slice(3),segments[`u${unit}-blend-${first}`],'first picture gets its own example after the explanation');
}
assert.equal(groups,16);assert.deepEqual(segments['u12-blend-sn'].map(s=>s.text),['/sn/','/sn/','snack.']);
assert.equal(sounds.sn.phonemes,'S N');assert.equal(sounds.sn.phonemes.match(/[0-2]/),null,'no vowel or letter-name phonemes in sn');
const lesson=fs.readFileSync('app/lesson.tsx','utf8');assert.match(lesson,/sentence\.pauseAfterMs\?\?tutorGap/);assert.match(lesson,/sentence\.nativePlayback/);assert.match(lesson,/WORDS\.find\(w=>'family' in w&&w.family===family\)\?\.word/);assert.ok(lesson.includes('playGreeting(corgi&&p.step===2?`u${activeUnit}-blend-${config?.families[blendIndex]}`'),'replay follows the displayed family');
console.log('PASS: 16 groups play blend twice + one matching word; no other example names; first-entry and selected-family replay stay aligned');
