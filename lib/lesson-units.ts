import {UNIT_TWO_WORDS,UNIT_TWO_QUESTIONS} from './unit-two';
export const UNIT_THREE_WORDS=[
 {word:'line',meaning:'선',ipa:'/laɪn/',family:'-ine'},
 {word:'nine',meaning:'숫자 9',ipa:'/naɪn/',family:'-ine'},
 {word:'pine',meaning:'소나무',ipa:'/paɪn/',family:'-ine'},
 {word:'vine',meaning:'덩굴',ipa:'/vaɪn/',family:'-ine'},
 {word:'bike',meaning:'자전거',ipa:'/baɪk/',family:'-ike'},
 {word:'hike',meaning:'등산하다',ipa:'/haɪk/',family:'-ike'},
 {word:'lime',meaning:'라임',ipa:'/laɪm/',family:'-ime'},
 {word:'time',meaning:'시간',ipa:'/taɪm/',family:'-ime'}
];
export const UNIT_FOUR_WORDS=[
 {word:'pipe',meaning:'파이프 · 관',ipa:'/paɪp/',family:'-ipe'},
 {word:'wipe',meaning:'닦다',ipa:'/waɪp/',family:'-ipe'},
 {word:'hide',meaning:'숨다',ipa:'/haɪd/',family:'-ide'},
 {word:'ride',meaning:'타다',ipa:'/raɪd/',family:'-ide'},
 {word:'bite',meaning:'물다 · 베어 물다',ipa:'/baɪt/',family:'-ite'},
 {word:'kite',meaning:'연',ipa:'/kaɪt/',family:'-ite'},
 {word:'dive',meaning:'물속으로 뛰어들다',ipa:'/daɪv/',family:'-ive'},
 {word:'five',meaning:'숫자 5',ipa:'/faɪv/',family:'-ive'}
];
export const EXTRA_UNITS={
 2:{words:UNIT_TWO_WORDS,questions:UNIT_TWO_QUESTIONS,vowel:'a',sound:'ay',soundIPA:'/eɪ/',soundKorean:'에이',soundSteps:'에 → 이',short:'can',shortMeaning:'깡통',shortIPA:'/kæn/',long:'cane',families:['-ame','-ane','-ase','-ate'],hasMedia:true},
 3:{words:UNIT_THREE_WORDS,questions:[{answer:'nine',choices:['line','nine']},{answer:'pine',choices:['vine','pine']},{answer:'bike',choices:['bike','hike']}],vowel:'i',sound:'eye',soundIPA:'/aɪ/',soundKorean:'아이',soundSteps:'아 → 이',short:'pin',shortMeaning:'핀',shortIPA:'/pɪn/',long:'pine',families:['-ine','-ike','-ime'],hasMedia:true},
 4:{words:UNIT_FOUR_WORDS,questions:[{answer:'pipe',choices:['pipe','wipe']},{answer:'kite',choices:['hide','kite']},{answer:'five',choices:['five','dive']}],vowel:'i',sound:'eye',soundIPA:'/aɪ/',soundKorean:'아이',soundSteps:'아 → 이',short:'kit',shortMeaning:'도구 세트',shortIPA:'/kɪt/',long:'kite',families:['-ipe','-ide','-ite','-ive'],hasMedia:false}
};
export function extraUnit(unit:number){return EXTRA_UNITS[unit as keyof typeof EXTRA_UNITS]}
export function illustratedWord(word:string){
 for(const [unit,data] of Object.entries(EXTRA_UNITS)){
  const found=data.words.find(w=>w.word===word);
  if(found)return {unit:Number(unit),meaning:found.meaning};
  if(word===data.short)return {unit:Number(unit),meaning:data.shortMeaning};
 }
}
