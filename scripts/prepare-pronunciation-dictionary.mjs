// Run with a local copy of https://github.com/cmusphinx/cmudict/blob/master/cmudict.dict.
// Retain only dictionary entries that can meet this curriculum's 50% threshold.
import {readFileSync,writeFileSync} from 'node:fs';
const targets=Object.values(JSON.parse(readFileSync(new URL('../lib/pronunciation-targets.json',import.meta.url)))).map(value=>value.split(' '));
if(!process.argv[2])throw Error('Provide the downloaded CMUdict path.');
function similarity(a,b){let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next}return 1-row[b.length]/Math.max(a.length,b.length)}
const all=Object.create(null);for(const line of readFileSync(process.argv[2],'utf8').split('\n')){const [entry,...phones]=line.split(' #')[0].trim().split(/\s+/);if(!entry||!phones.length)continue;const word=entry.replace(/\(\d+\)$/,'');if(!/^[a-z]+$/.test(word))continue;const sound=phones.map(p=>p.replace(/[0-9]/g,'')).join(' ');all[word]??=[];if(!all[word].includes(sound))all[word].push(sound)}
const subset=Object.fromEntries(Object.entries(all).filter(([,variants])=>variants.some(sound=>targets.some(target=>similarity(target,sound.split(' '))>=.5))).sort(([a],[b])=>a.localeCompare(b)));
writeFileSync(new URL('../lib/pronunciation-dictionary.json',import.meta.url),JSON.stringify(subset)+'\n');console.log(`${Object.keys(subset).length} nearby dictionary words retained`);
