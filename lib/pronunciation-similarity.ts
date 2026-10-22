import dictionary from './pronunciation-dictionary.json';
import targets from './pronunciation-targets.json';
const pronunciations:Record<string,string[]>=dictionary;
const targetSounds:Record<string,string>=targets;
// ASR-word pronunciation similarity, not acoustic accuracy or ASR confidence.
// Substitution, insertion and deletion each cost one phoneme; stress is ignored.
export function phonemeSimilarity(expected:readonly string[],heard:readonly string[]){
 if(!expected.length||!heard.length)return 0;
 let row=Array.from({length:heard.length+1},(_,index)=>index);
 for(let i=1;i<=expected.length;i++){const next=[i];for(let j=1;j<=heard.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(expected[i-1]===heard[j-1]?0:1));row=next}
 return 1-row[heard.length]/Math.max(expected.length,heard.length);
}
export function pronunciationSimilarity(target:string,heard:string){
 const expected=Object.hasOwn(targetSounds,target)?targetSounds[target]:undefined;if(!expected)return 0;
 if(target===heard)return 1;
 return Math.max(0,...(Object.hasOwn(pronunciations,heard)?pronunciations[heard]:[]).map(sound=>phonemeSimilarity(expected.split(' '),sound.split(' '))));
}
