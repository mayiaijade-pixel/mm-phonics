// Completion cues follow the activity, rather than an arbitrary timer.
export function nextLessonReady(step:number,narrationDone:boolean,practiceDone:boolean,magic:boolean,blend:boolean,quiz:number){
 if(step===3)return practiceDone;
 if(step===5)return quiz>=3;
 if(step===6)return magic&&narrationDone;
 if(step===2&&!blend)return magic&&narrationDone;
 return narrationDone;
}
