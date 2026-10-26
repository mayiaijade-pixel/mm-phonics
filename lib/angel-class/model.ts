import {z} from 'zod';
export const STUDENTS=['지한','오름','이서'] as const;
export const WEEKS=[{id:'nov-1',label:'11월 1주차'},{id:'nov-2',label:'11월 2주차'},{id:'nov-3',label:'11월 3주차'},{id:'nov-4',label:'11월 4주차'},{id:'dec-1',label:'12월 1주차'},{id:'dec-2',label:'12월 2주차'}] as const;
export const MAX_VIDEO_BYTES=80*1024*1024;
export const weekSchema=z.enum(['nov-1','nov-2','nov-3','nov-4','dec-1','dec-2']);
export const studentSchema=z.enum(STUDENTS);
export const itemSchema=z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(160),kind:z.enum(['video','check'])});
export const actionSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('publish'),week:weekSchema,items:z.array(itemSchema).max(20).refine(a=>new Set(a.map(x=>x.id)).size===a.length)}),
 z.object({action:z.literal('complete'),assignmentId:z.string().uuid(),done:z.boolean()}),
 z.object({action:z.literal('remove-video'),assignmentId:z.string().uuid()}),
 z.object({action:z.literal('upload-ticket'),assignmentId:z.string().uuid(),size:z.number().int().min(200).max(MAX_VIDEO_BYTES),contentType:z.enum(['video/mp4','video/webm','video/quicktime','video/x-m4v'])})
]);
export type Assignment=z.infer<typeof itemSchema>&{week:string;position:number};
export type Submission={assignmentId:string;student:typeof STUDENTS[number];done:boolean;uploadedAt:string|null;videoUrl:string|null};
export type ClassSession={role:'class'|'student'|'teacher';student?:typeof STUDENTS[number]};
export type ClassState={session:ClassSession|null;teacherProtected:boolean;assignments:Assignment[];submissions:Submission[]};
export const EXAMPLE_ITEMS=[{title:'Story 읽는 영상 올리기',kind:'video' as const},{title:'스피드파닉스2 Unit 1 워크북 완료하기',kind:'check' as const},{title:'스피드파닉스2 Unit 1 본책 9페이지까지 완료하기',kind:'check' as const}];

export const sessionInput=z.object({action:z.enum(['login','select','switch','logout']),password:z.string().max(128).optional(),role:z.enum(['student','teacher']).optional(),student:studentSchema.optional()});

export type MediaLinkCache=Map<string,{url:string;uploadedAt:string|null;expires:number}>;
// Keep a playing video stable while the classroom refreshes in the background.
export function stableMediaLinks(submissions:Submission[],cache:MediaLinkCache,now=Date.now()){
 const active=new Set<string>();const next=submissions.map(s=>{const key=s.student+':'+s.assignmentId;if(!s.videoUrl){cache.delete(key);return s}active.add(key);const old=cache.get(key);if(old&&old.uploadedAt===s.uploadedAt&&old.expires>now)return {...s,videoUrl:old.url};cache.set(key,{url:s.videoUrl,uploadedAt:s.uploadedAt,expires:now+45*60000});return s});for(const key of cache.keys())if(!active.has(key))cache.delete(key);return next;
}
