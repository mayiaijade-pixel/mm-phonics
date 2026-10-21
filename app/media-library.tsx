'use client';
import {useState} from 'react';
import {ArrowLeft,Film,Music,Play} from 'lucide-react';
import videos from './lesson-videos.json';
import SongPlaylist from './song-playlist';
const collections=[{unit:1,title:'Four Seasons',clips:videos},{unit:2,title:'The Name Game',clips:videos.unit2},{unit:3,title:'Let’s Go Together!',clips:videos.unit3}];
export default function MediaLibrary({kind,onHome}:{kind:'story'|'song';onHome:()=>void}){
 const [selected,setSelected]=useState<number|null>(null);
 const unitLabel=(unit:number)=>`Unit ${unit} · Long ${unit>=3?'i (i+e)':'a (a+e)'}`;
 const item=collections.find(item=>item.unit===selected),clip=item?.clips[kind];
 const Icon=kind==='story'?Film:Music,label=kind==='story'?'Story':'Song';
 if(kind==='song')return <SongPlaylist onHome={onHome}/>;
 return <section className="media-library"><button className="library-back" onClick={item?()=>setSelected(null):onHome}><ArrowLeft size={18}/>{item?`All ${label==='Story'?'stories':'songs'}`:'Home'}</button><div className="library-heading"><span className="library-symbol"><Icon size={28}/></span><h1>{item?item.title:label}</h1><p>{item?`${unitLabel(item.unit)} · ${label}`:kind==='story'?'미미의 이야기를 골라봐요.':'좋아하는 노래를 골라봐요.'}</p></div>{item&&clip?<div className="library-player"><video key={`${kind}-${item.unit}`} controls playsInline preload="metadata" poster={clip.poster} aria-label={`Unit ${item.unit} ${label}: ${item.title}`}><source src={clip.src} type="video/mp4"/></video><div className="library-player-caption"><span>{unitLabel(item.unit)}</span><h2>{item.title}</h2></div></div>:<div className="media-library-grid">{collections.map(({unit,title,clips})=><button key={unit} className="media-library-card" onClick={()=>{setSelected(unit)}} aria-label={`Play Unit ${unit} ${label}: ${title}`}><div className="media-library-thumbnail"><img src={clips[kind].poster} alt={`${title} ${label} 미리보기`}/><span className="thumbnail-play"><Play size={23} fill="currentColor"/></span><span className="thumbnail-duration">{clips[kind].duration}</span></div><div className="media-library-caption"><span>{unitLabel(unit)}</span><h2>{title}</h2></div></button>)}</div>}</section>
}
