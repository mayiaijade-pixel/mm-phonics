'use client';
import {useEffect,useState} from 'react';
import {INTRO_LETTERS,MIMI_LETTER_IMAGES,KOGI_LETTER_IMAGE,blendLabel} from '../lib/intro-letters';
type Props={intro?:boolean;joined?:boolean;speaker?:'mimi'|'corgi';speaking?:boolean;letterUnit?:number};
export default function TutorDuo({intro=false,joined=true,speaker='mimi',speaking=false,letterUnit}:Props){
 const [letterIndex,setLetterIndex]=useState(0),[chosen,setChosen]=useState(false);
 const letters=intro&&letterUnit?INTRO_LETTERS[letterUnit]:undefined;
 const index=letterIndex%(letters?.length||1),letter=letters?.[index];
 useEffect(()=>{setLetterIndex(0);setChosen(false)},[letterUnit]);
 useEffect(()=>{
  if(!letters||!joined||chosen||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const timer=setInterval(()=>setLetterIndex(i=>(i+1)%letters.length),4000);
  return()=>clearInterval(timer);
 },[letters,joined,chosen]);
 return <div className={`tutor-duo ${intro?'duo-intro':''} ${joined?'duo-joined':'duo-waiting'} ${letters?'duo-letter-scene':''}`} aria-label="함께 알려주는 미미와 코기">
  {letter&&<div className="duo-blend-label" aria-hidden={!joined}><span>{letter}</span><i>+</i><span>L</span><i>→</i><strong>{(letter+'L').toLowerCase()}</strong></div>}
  <div className={`duo-character duo-kogi ${speaking&&speaker==='corgi'?'duo-speaking':''}`} aria-hidden={!joined}><img src={letters?KOGI_LETTER_IMAGE:'/images/corgi.png'} alt={letters?'대문자 L을 들고 있는 코기':'코기'} draggable={false}/></div>
  <div className={`duo-character duo-mimi ${speaking&&speaker==='mimi'?'duo-speaking':''}`}>
   {letter&&letterUnit?<div className="duo-letter-window"><img className="mimi-letter-atlas" src={MIMI_LETTER_IMAGES[letterUnit]} alt={`대문자 ${letter}를 들고 있는 미미`} draggable={false} style={{left:`-${index*100}%`}}/></div>:<img src="/images/mimi.png" alt="미미" draggable={false}/>}
  </div>
  {letters&&<div className="duo-letter-choices" role="group" aria-label="두 글자 이어 보기" aria-hidden={!joined}>{letters.map((l,i)=><button key={l} disabled={!joined} aria-pressed={index===i} aria-label={blendLabel(l)} onClick={()=>{setLetterIndex(i);setChosen(true)}}>{l}<span>L</span></button>)}</div>}
 </div>;
}
