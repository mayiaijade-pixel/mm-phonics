import {Volume2,Star,BookOpen,Check,RotateCcw} from 'lucide-react';
import HighlightedSpeech from './highlighted-speech';
type Props={unit:number;name:string;stars:number;caption:string;words:{word:string}[];speaking:boolean;showKorean:boolean;homeworkDone:boolean;onReplayAudio:()=>void;onKorean:()=>void;onWord:(word:string)=>void;onHomework:()=>void;onReplay:()=>void};
export default function LessonFinish(p:Props){
 return <section className="lesson-finish" aria-label="Quiz reward and homework">
  <div className="finish-top"><div className="finish-stars" role="img" aria-label={`${p.stars} stars`}>{Array.from({length:p.stars},(_,i)=><Star key={i} size={32} fill="currentColor"/>)}</div><h2>{p.stars===3?'세 문제 모두 맞췄어요!':'오늘의 숙제를 확인해요!'}</h2><p>{p.stars>0?`별 ${p.stars}개를 받았어요! 오늘의 숙제를 확인해요.`:'미미와 함께 복습해요.'}</p></div>
  <div className="finish-speech"><p lang="en"><HighlightedSpeech text={p.caption||`Great job, ${p.name}! You earned three stars!`} words={p.words.map(w=>w.word)}/></p></div>
  <div className="finish-audio"><button onClick={p.onReplayAudio} aria-label="Listen again · 숙제 안내 다시 듣기"><Volume2 size={19}/></button><button onClick={p.onKorean} aria-expanded={p.showKorean}>한국어</button></div>
  <div className={'finish-mimi '+(p.speaking?'is-speaking':'')}><img src="/images/mimi.png" alt="별을 축하하는 미미"/>{p.words.map((w,i)=><button key={w.word} className={`floating-word floating-word-${i}`} onClick={()=>p.onWord(w.word)} aria-label={`Listen: ${w.word}`}>{w.word==='june'?'June':w.word}</button>)}</div>
  {p.showKorean&&<p className="finish-korean">잘했어, {p.name}! Speed Phonics 2권 <b>Unit {p.unit}</b>{p.unit===1?' 4~9페이지를 엄마와 함께 풀어봐요.':' 단어를 엄마와 함께 복습해봐요.'}</p>}
  <div className="finish-homework"><h3><BookOpen size={20}/> 오늘의 숙제</h3><p>Speed Phonics 2권 · <b>Unit {p.unit}</b></p><strong>{p.unit===1?'4~9페이지를 엄마와 함께 풀어보기':'엄마와 함께 배운 단어 8개 복습하기'}</strong><button onClick={p.onHomework} aria-pressed={p.homeworkDone}><Check size={17}/>{p.homeworkDone?'Homework done!':'Mark as done'}</button></div>
  <button className="finish-replay" onClick={p.onReplay}><RotateCcw size={16}/> Practice again</button>
 </section>;
}
