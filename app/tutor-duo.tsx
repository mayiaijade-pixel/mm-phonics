type Props={intro?:boolean;joined?:boolean;speaker?:'mimi'|'corgi';speaking?:boolean};
export default function TutorDuo({intro=false,joined=true,speaker='mimi',speaking=false}:Props){
 return <div className={`tutor-duo ${intro?'duo-intro':''} ${joined?'duo-joined':'duo-waiting'}`} aria-label="함께 알려주는 미미와 코기">
  <div className={`duo-character duo-kogi ${speaking&&speaker==='corgi'?'duo-speaking':''}`} aria-hidden={!joined}><img src="/images/corgi.png" alt="코기" draggable={false}/></div>
  <div className={`duo-character duo-mimi ${speaking&&speaker==='mimi'?'duo-speaking':''}`}><img src="/images/mimi.png" alt="미미" draggable={false}/></div>
 </div>;
}
