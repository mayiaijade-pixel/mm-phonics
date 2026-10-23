import {blendWord} from '../lib/blend-units';
export default function BlendPicture({word}:{word:string}){
 const scene=blendWord(word);if(!scene)return null;
 return <div className={'animated-scene corgi-word-scene blend-scene-'+word} role="img" aria-label={`미미·코기와 ${scene.meaning} 장면`}><div className="corgi-atlas-window"><img src={`/images/unit${scene.unit}/duo-word-atlas.png`} alt="" draggable={false} style={{left:`-${scene.index%3*100}%`,top:`-${Math.floor(scene.index/3)*100}%`}}/></div></div>;
}
