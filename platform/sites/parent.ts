import {getDatabase} from '../../db';
import {getChatGPTUser} from '../../app/chatgpt-auth';
import {parentAction,parentInput,parentView,type ParentRecord} from '../../lib/parent';
export async function GET(){const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요해요.'},{status:401});try{const row=await getDatabase().prepare('SELECT value FROM parent_settings WHERE user_id = ?').bind(user.userId).first();return Response.json(parentView(row?JSON.parse(String(row.value)):null),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'부모 설정을 불러오지 못했어요.'},{status:503})}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'요청을 확인해 주세요.'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요해요.'},{status:401});
 const parsed=parentInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:'비밀번호(8자 이상)와 보상 내용 길이(최대 12개)를 확인해 주세요.'},{status:400});
 try{const db=getDatabase();const row=await db.prepare('SELECT value FROM parent_settings WHERE user_id = ?').bind(user.userId).first();const before=row?String(row.value):null;const result=await parentAction(before?JSON.parse(before) as ParentRecord:null,parsed.data);
 if(result.record){const value=JSON.stringify(result.record);const saved=before===null?await db.prepare('INSERT INTO parent_settings (user_id,value) VALUES (?,?) ON CONFLICT(user_id) DO NOTHING').bind(user.userId,value).run():await db.prepare('UPDATE parent_settings SET value = ? WHERE user_id = ? AND value = ?').bind(value,user.userId,before).run();if(!saved.meta.changes)return Response.json({error:'설정이 변경됐어요. 다시 시도해 주세요.'},{status:409})}
 return Response.json(result.error?{error:result.error}:parentView(result.record),{status:result.status,headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'부모 설정을 저장하지 못했어요.'},{status:503})}
}
