export const CORGI_VOICE_ID='nLxulrrbRg9nJamIJY8Z';
export const CORGI_IMAGE='/images/corgi.png';
export type BlendWord={word:string;meaning:string;ipa:string;family:string};
const word=(word:string,meaning:string,ipa:string,family:string):BlendWord=>({word,meaning,ipa,family});
export const UNIT_8_WORDS=[word('black','검은색의','/blæk/','bl'),word('block','블록','/blɑːk/','bl'),word('blue','파란색의','/bluː/','bl'),word('clap','박수 치다','/klæp/','cl'),word('cliff','절벽','/klɪf/','cl'),word('clock','시계','/klɑːk/','cl'),word('flag','깃발','/flæɡ/','fl'),word('flap','날개를 퍼덕이다','/flæp/','fl'),word('flute','플루트','/fluːt/','fl')];
export const UNIT_9_WORDS=[word('glass','유리잔','/ɡlæs/','gl'),word('globe','지구본','/ɡloʊb/','gl'),word('glue','풀 · 접착제','/ɡluː/','gl'),word('plane','비행기','/pleɪn/','pl'),word('plate','접시','/pleɪt/','pl'),word('plum','자두','/plʌm/','pl'),word('sled','썰매','/sled/','sl'),word('slide','미끄럼틀','/slaɪd/','sl'),word('slim','날씬한 · 가느다란','/slɪm/','sl')];
export type BlendUnit={words:BlendWord[];questions:{answer:string;choices:string[]}[];vowel:string;sound:string;soundIPA:string;soundKorean:string;soundSteps:string;short:string;shortMeaning:string;shortIPA:string;long:string;families:string[];hasMedia:boolean};
export const BLEND_UNITS:Record<number,BlendUnit>={
 8:{words:UNIT_8_WORDS,questions:[{answer:'block',choices:['black','block']},{answer:'clock',choices:['clap','clock']},{answer:'flute',choices:['flute','flag']}],vowel:'bl · cl · fl',sound:'black',soundIPA:'/bl/',soundKorean:'bl',soundSteps:'black',short:'black',shortMeaning:'검은색의',shortIPA:'/blæk/',long:'blue',families:['bl','cl','fl'],hasMedia:false},
 9:{words:UNIT_9_WORDS,questions:[{answer:'globe',choices:['globe','glass']},{answer:'plum',choices:['plane','plum']},{answer:'slide',choices:['sled','slide']}],vowel:'gl · pl · sl',sound:'glass',soundIPA:'/ɡl/',soundKorean:'gl',soundSteps:'glass',short:'glass',shortMeaning:'유리잔',shortIPA:'/ɡlæs/',long:'glue',families:['gl','pl','sl'],hasMedia:false}
};
export function blendWord(word:string){for(const [unit,config] of Object.entries(BLEND_UNITS)){const index=config.words.findIndex(w=>w.word===word);if(index>=0)return {...config.words[index],unit:Number(unit),index}}return null}
export function isCorgiScene(scene?:string){return /^u[89]-/.test(scene||'')||/^corgi-/.test(scene||'')}
