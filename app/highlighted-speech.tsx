export default function HighlightedSpeech({text,words=[]}:{text:string;words?:string[]}){
 const escaped=words.filter(Boolean).map(word=>word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length);
 const pattern=new RegExp('\\b(short (?:vowel|[aiou])|long (?:vowel|[aiou])|magic e|final e|silent|three stars|unit \\d+'+(escaped.length?'|'+escaped.join('|'):'')+')\\b','gi');
 return <>{text.split(pattern).map((part,index)=>index%2?<mark key={index} className={/^unit /i.test(part)?'speech-highlight unit-highlight':/^short /i.test(part)?'speech-highlight short-highlight':'speech-highlight'}>{part}</mark>:part)}</>;
}
