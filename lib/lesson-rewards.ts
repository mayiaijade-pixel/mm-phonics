export type RewardEntry={stars:number;completions:number;awarded:boolean};
export type RewardSource={completed?:boolean;rewards?:Record<string,RewardEntry>;[key:string]:unknown};
export function unitReward(course:RewardSource,unit:number):RewardEntry{
 const saved=course.rewards?.[String(unit)];if(saved)return saved;
 const progress=unit===1?course:course['unit'+unit] as {completed?:boolean}|undefined;
 return {stars:progress?.completed?3:0,completions:progress?.completed?1:0,awarded:!!progress?.completed};
}
export function totalStars(course:RewardSource){return Array.from({length:7},(_,i)=>unitReward(course,i+1).stars).reduce((a,b)=>a+b,0)}
export function awardQuiz<T extends RewardSource>(course:T,unit:number,count:number):T{
 const previous=unitReward(course,unit),earned=Math.max(0,Math.min(3,Math.trunc(count)));
 const reward=previous.awarded?previous:{stars:previous.stars+earned,completions:previous.completions+1,awarded:true};
 const rewards={...course.rewards,[String(unit)]:reward};
 if(unit===1)return {...course,quiz:earned,completed:true,rewards};
 return {...course,rewards,['unit'+unit]:{...(course['unit'+unit] as object),quiz:earned,completed:true}};
}
export function replayUnit<T extends RewardSource>(course:T,unit:number):T{
 const rewards={...course.rewards,[String(unit)]:{...unitReward(course,unit),awarded:false}};
 if(unit===1)return {...course,rewards,step:0,word:0,quiz:0};
 return {...course,rewards,['unit'+unit]:{...(course['unit'+unit] as object),step:0,word:0,quiz:0}};
}
