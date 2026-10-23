import {BookOpen,Check,ChevronLeft,Star} from 'lucide-react';
import {HOMEWORK_PAGES,homeworkPages} from '../lib/homework';

type Props={approved:number[];ready:boolean;error:string;onApprove:(unit:number)=>void;onBack:()=>void;onRetry:()=>void};
export default function HomeworkOverview({approved,ready,error,onApprove,onBack,onRetry}:Props){
 const units=Object.keys(HOMEWORK_PAGES).map(Number);
 const completed=units.filter(unit=>approved.includes(unit)).length;
 return <section className="homework-overview" aria-labelledby="all-homework-title">
  <button className="text-button" onClick={onBack}><ChevronLeft size={17}/> Back to homework</button>
  <header className="homework-overview-heading"><span>HOMEWORK CHECKLIST</span><h1 id="all-homework-title">전체 숙제 확인하기</h1><p>Speed Phonics 2권 · 단원별 교재 숙제</p></header>
  <div className="homework-overview-summary"><div><BookOpen size={25}/><strong>{ready?`${completed} / ${units.length}`:'— / 12'}<small>개 단원 완료</small></strong></div><progress value={ready?completed:0} max={units.length} aria-label="전체 숙제 완료율"/><p>부모 확인 후 단원마다 <Star size={13} fill="currentColor"/> 3개를 받아요.</p></div>
  {error?<div className="parent-error" role="alert"><p>{error}</p><button className="text-button" onClick={onRetry}>Try again</button></div>:!ready?<p role="status">숙제 기록을 불러오는 중이에요.</p>:null}
  <ul className="homework-unit-list" aria-label="Unit별 숙제 완료 여부">{units.map(unit=>{const done=approved.includes(unit);return <li className={done?'homework-unit-done':''} key={unit}><span className="homework-unit-number">{String(unit).padStart(2,'0')}</span><div className="homework-unit-details"><h2>Unit {unit}</h2><p>{homeworkPages(unit)}페이지 풀기</p><small>{ready?(done?'완료 · ★ 3개 지급됨':'미완료'):'확인 중…'}</small></div><button className="homework-unit-check" role="checkbox" aria-checked={ready&&done} aria-label={`Unit ${unit} 숙제 ${done?'완료':'완료 체크'}`} disabled={!ready||done} onClick={()=>onApprove(unit)}><span className="homework-check-box">{done&&<Check size={18} strokeWidth={3}/>}</span><span>{done?'Done':'Check'}</span></button></li>})}</ul>
  <p className="homework-overview-note">완료 체크는 부모 비밀번호로 확인해요.<br/>이미 완료한 단원에는 별이 중복 지급되지 않아요.</p>
 </section>;
}
