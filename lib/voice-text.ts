// Read the alphabet's name as /eɪ/, while keeping the article in “a game” intact.
export function letterNamesForSpeech(text:string){
 return text.replace(/\b(long|short|letter)\s+o\b/gi,(_,c:string)=>c+' oh').replace(/\b(long|short|letter)\s+u\b/gi,(_,c:string)=>c+' you').replace(/\b(long|short|letter)\s+a\b/gi,(_,context:string)=>context+' A').replace(/\bthe\s+a\s+says\b/gi,'The A says').replace(/\b(long|short|letter)\s+i\b/gi,(_,context:string)=>context+' eye').replace(/\bthe\s+i\s+says\b/gi,'The eye says');
}

// Apply after XML escaping. Only letter-name contexts receive /eɪ/;
// ordinary articles such as “a game” remain untouched.
export function letterNamesWithPhonemes(escapedText:string){
 const letter='<phoneme alphabet="cmu-arpabet" ph="EY1">A</phoneme>';
 return escapedText.replace(/\b(long|short|letter)\s+A\b/gi,(_,context:string)=>context+' '+letter).replace(/\bthe\s+A\s+says\b/gi,'The '+letter+' says');
}
