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
export const UNIT_5_WORDS=[{"word": "hose", "meaning": "호스", "ipa": "/hoʊz/", "family": "-ose"}, {"word": "nose", "meaning": "코", "ipa": "/noʊz/", "family": "-ose"}, {"word": "pose", "meaning": "자세를 취하다", "ipa": "/poʊz/", "family": "-ose"}, {"word": "rose", "meaning": "장미", "ipa": "/roʊz/", "family": "-ose"}, {"word": "hope", "meaning": "바라다", "ipa": "/hoʊp/", "family": "-ope"}, {"word": "rope", "meaning": "밧줄", "ipa": "/roʊp/", "family": "-ope"}, {"word": "note", "meaning": "쪽지", "ipa": "/noʊt/", "family": "-ote"}, {"word": "vote", "meaning": "투표하다", "ipa": "/voʊt/", "family": "-ote"}];
export const UNIT_6_WORDS=[{"word": "hole", "meaning": "구멍", "ipa": "/hoʊl/", "family": "-ole"}, {"word": "mole", "meaning": "두더지", "ipa": "/moʊl/", "family": "-ole"}, {"word": "pole", "meaning": "막대기", "ipa": "/poʊl/", "family": "-ole"}, {"word": "sole", "meaning": "신발 밑창", "ipa": "/soʊl/", "family": "-ole"}, {"word": "dome", "meaning": "둥근 지붕", "ipa": "/doʊm/", "family": "-ome"}, {"word": "home", "meaning": "집", "ipa": "/hoʊm/", "family": "-ome"}, {"word": "bone", "meaning": "뼈다귀", "ipa": "/boʊn/", "family": "-one"}, {"word": "cone", "meaning": "원뿔", "ipa": "/koʊn/", "family": "-one"}];
export const UNIT_7_WORDS=[{"word": "cube", "meaning": "정육면체", "ipa": "/kjuːb/", "family": "-ube"}, {"word": "tube", "meaning": "튜브", "ipa": "/tuːb/", "family": "-ube"}, {"word": "cute", "meaning": "귀여운", "ipa": "/kjuːt/", "family": "-ute"}, {"word": "mute", "meaning": "소리를 끄다", "ipa": "/mjuːt/", "family": "-ute"}, {"word": "dune", "meaning": "모래언덕", "ipa": "/duːn/", "family": "-une"}, {"word": "june", "meaning": "6월", "ipa": "/dʒuːn/", "family": "-une"}, {"word": "tune", "meaning": "곡조", "ipa": "/tuːn/", "family": "-une"}, {"word": "mule", "meaning": "노새", "ipa": "/mjuːl/", "family": "-ule"}];
export const EXTRA_UNITS={
 7:{words:UNIT_7_WORDS,"questions": [{"answer": "cube", "choices": ["cube", "tube"]}, {"answer": "cute", "choices": ["cute", "mute"]}, {"answer": "tune", "choices": ["tune", "mule"]}], "vowel": "u", "sound": "you", "soundIPA": "/juː/", "soundKorean": "유", "soundSteps": "이 → 우", "short": "cub", "shortMeaning": "아기 곰", "shortIPA": "/kʌb/", "long": "cube", "families": ["-ube", "-ute", "-une", "-ule"], "hasMedia": false},
 6:{words:UNIT_6_WORDS,"questions": [{"answer": "hole", "choices": ["hole", "mole"]}, {"answer": "pole", "choices": ["pole", "sole"]}, {"answer": "bone", "choices": ["bone", "cone"]}], "vowel": "o", "sound": "oh", "soundIPA": "/oʊ/", "soundKorean": "오우", "soundSteps": "오 → 우", "short": "not", "shortMeaning": "아니다", "shortIPA": "/nɑt/", "long": "note", "families": ["-ole", "-ome", "-one"], "hasMedia": false},
 5:{words:UNIT_5_WORDS,"questions": [{"answer": "hose", "choices": ["hose", "nose"]}, {"answer": "pose", "choices": ["pose", "rose"]}, {"answer": "note", "choices": ["note", "vote"]}], "vowel": "o", "sound": "oh", "soundIPA": "/oʊ/", "soundKorean": "오우", "soundSteps": "오 → 우", "short": "hop", "shortMeaning": "깡충 뛰다", "shortIPA": "/hɑp/", "long": "hope", "families": ["-ose", "-ope", "-ote"], "hasMedia": false},
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
