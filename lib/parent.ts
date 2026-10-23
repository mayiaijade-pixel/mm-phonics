import {z} from 'zod';
export const goalSchema=z.object({id:z.string().min(1).max(60),stars:z.number().int().min(1).max(9999),title:z.string().trim().min(1).max(80)});
export type Goal=z.infer<typeof goalSchema>;
export type ParentRecord={salt:string;hash:string;goals:Goal[];approved:number[];failures:number;lockedUntil:number};
export type ParentView={configured:boolean;goals:Goal[];approved:number[]};
export const EMPTY_PARENT:ParentView={configured:false,goals:[],approved:[]};
export const parentInput=z.object({action:z.enum(['setup','password','goals','approve']),password:z.string().max(128).default(''),newPassword:z.string().min(8).max(128).optional(),unit:z.number().int().min(1).max(12).optional(),goals:z.array(goalSchema).max(12).refine(v=>new TextEncoder().encode(JSON.stringify(v)).length<=2000,'보상 내용을 조금 짧게 입력해 주세요.').optional()});
export function parentView(record:ParentRecord|null):ParentView{return record?{configured:true,goals:record.goals,approved:record.approved}:EMPTY_PARENT}
const enc=new TextEncoder();
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')}
export async function newPassword(password:string){const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');return {salt,hash:await passwordHash(password,salt)}}
export async function parentAction(record:ParentRecord|null,input:z.infer<typeof parentInput>,now=Date.now()):Promise<{record:ParentRecord|null;status:number;error?:string}>{
 if(!record){if(input.action!=='setup'||!input.newPassword)return {record,status:409,error:'먼저 My Page에서 부모 비밀번호를 설정해 주세요.'};return {record:{...await newPassword(input.newPassword),goals:[],approved:[],failures:0,lockedUntil:0},status:200}}
 if(record.lockedUntil>now)return {record,status:429,error:'잠시 쉬었다가 다시 입력해 주세요. 5분 후 다시 시도할 수 있어요.'};
 const hash=await passwordHash(input.password,record.salt);let diff=hash.length^record.hash.length;for(let i=0;i<hash.length;i++)diff|=hash.charCodeAt(i)^record.hash.charCodeAt(i);
 if(diff){const failures=record.failures+1;return {record:{...record,failures,lockedUntil:failures>=5?now+300000:0},status:403,error:'부모 비밀번호를 확인해 주세요.'}}
 const next={...record,failures:0,lockedUntil:0};
 if(input.action==='setup')return {record:next,status:409,error:'이미 비밀번호가 설정되어 있어요.'};
 if(input.action==='password'){if(!input.newPassword)return {record:next,status:400,error:'새 비밀번호를 입력해 주세요.'};Object.assign(next,await newPassword(input.newPassword))}
 if(input.action==='goals'){if(!input.goals)return {record:next,status:400,error:'보상을 입력해 주세요.'};next.goals=input.goals}
 if(input.action==='approve'){if(!input.unit)return {record:next,status:400,error:'단원을 선택해 주세요.'};next.approved=[...new Set([...next.approved,input.unit])].sort((a,b)=>a-b)}
 return {record:next,status:200};
}
