'use client';
import {useEffect,useRef} from 'react';
export default function SongAudio({src,title,unit,poster}:{src:string;title:string;unit:number;poster:string}){
 const ref=useRef<HTMLAudioElement>(null);
 useEffect(()=>{
  const audio=ref.current;if(!audio||!('mediaSession' in navigator))return;
  const session=navigator.mediaSession;
  const metadata=()=>{if(typeof MediaMetadata!=='undefined')session.metadata=new MediaMetadata({title,artist:'Mimi’s Phonics',album:`Unit ${unit}`,artwork:[{src:new URL(poster,location.href).href,type:'image/jpeg'}]})};
  const position=()=>{if(session.setPositionState&&Number.isFinite(audio.duration)&&audio.duration>0)try{session.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)})}catch{}};
  const play=()=>{metadata();session.playbackState='playing';position()};
  const pause=()=>{session.playbackState='paused';position()};
  const end=()=>{session.playbackState='none'};
  const handlers:Partial<Record<MediaSessionAction,MediaSessionActionHandler>>={play:()=>{void audio.play().catch(()=>{})},pause:()=>audio.pause(),seekbackward:d=>{audio.currentTime=Math.max(0,audio.currentTime-(d.seekOffset??10));position()},seekforward:d=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+(d.seekOffset??10));position()},seekto:d=>{if(d.seekTime!==undefined&&Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,Math.max(0,d.seekTime));position()}};
  for(const [action,handler]of Object.entries(handlers))try{session.setActionHandler(action as MediaSessionAction,handler)}catch{}
  audio.addEventListener('play',play);audio.addEventListener('pause',pause);audio.addEventListener('ended',end);audio.addEventListener('loadedmetadata',position);audio.addEventListener('timeupdate',position);
  return()=>{audio.pause();audio.removeEventListener('play',play);audio.removeEventListener('pause',pause);audio.removeEventListener('ended',end);audio.removeEventListener('loadedmetadata',position);audio.removeEventListener('timeupdate',position);for(const action of Object.keys(handlers))try{session.setActionHandler(action as MediaSessionAction,null)}catch{}session.playbackState='none';session.metadata=null};
 },[src,title,unit,poster]);
 return <div className="song-audio-player"><img src={poster} alt={title}/><audio ref={ref} src={src} controls preload="metadata" aria-label={`Unit ${unit} ${title} audio`}/><p>Play를 누른 뒤 화면을 잠그고 들어보세요.</p></div>
}
