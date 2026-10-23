import {blendWord} from '../lib/blend-units';
const MOTIONS:Record<string,string>={slide:'코기가 미끄럼틀을 타고 내려와요',sled:'미미가 눈 위에서 썰매를 타요',black:'검정 페인트가 미미의 볼에 묻어요',blue:'파란 페인트가 코기의 볼에 묻어요',block:'미미와 코기가 블록을 차곡차곡 쌓아요',clap:'미미와 코기가 앞발을 모아 박수 쳐요',flap:'새가 날개를 퍼덕여요',flute:'미미와 코기가 손가락을 움직이며 플루트를 불어요'};
export default function BlendPicture({word}:{word:string}){
 const scene=blendWord(word);if(!scene)return null;
 if(MOTIONS[word])return <div className={'animated-scene corgi-word-scene action-scene action-'+word} role="img" aria-label={MOTIONS[word]}><div className="word-motion-window"><img className="word-motion-frames" src={`/images/unit${scene.unit}/actions/${word}.png`} alt="" draggable={false}/></div></div>;
 return <div className={'animated-scene corgi-word-scene blend-scene-'+word} role="img" aria-label={`미미·코기와 ${scene.meaning} 장면`}><div className="corgi-atlas-window"><img src={`/images/unit${scene.unit}/duo-word-atlas.png`} alt="" draggable={false} style={{left:`-${scene.index%3*100}%`,top:`-${Math.floor(scene.index/3)*100}%`}}/></div></div>;
}
