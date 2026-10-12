// Read the alphabet's name as /eɪ/, while keeping the article in “a game” intact.
export function letterNamesForSpeech(text:string){
 return text.replace(/\b(long|short|letter)\s+a\b/gi,(_,context:string)=>context+' ay').replace(/\bthe\s+a\s+says\b/gi,'The ay says');
}
