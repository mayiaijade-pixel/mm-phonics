import {z} from 'zod';
import {getDatabase} from '../../db';
import {getChatGPTUser} from '../../app/chatgpt-auth';
const unavailable=()=>Response.json({error:'진도를 저장할 수 없어요. 잠시 후 다시 시도해 주세요.'},{status:503});
export async function GET(){
 const user=await getChatGPTUser(); if(!user)return Response.json({error:'로그인이 필요해요.'},{status:401});
 try{const row=await getDatabase().prepare('SELECT name, name_confirmed, step, word, quiz, completed, homework, unit2, unit3, unit4 FROM lesson_progress WHERE user_id = ?').bind(user.userId).first();return Response.json({progress:row?{...row,unit2:row.unit2?JSON.parse(String(row.unit2)):undefined,unit3:row.unit3?JSON.parse(String(row.unit3)):undefined,unit4:row.unit4?JSON.parse(String(row.unit4)):undefined,resetVersion:1,homework:JSON.parse(String(row.homework)),completed:!!row.completed,nameConfirmed:!!row.name_confirmed}:null});}catch(e){console.error('Progress read failed',e);return unavailable();}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요해요.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'요청을 확인해 주세요.'},{status:403});

 const schema=z.object({unit2:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit2')).max(1)}).optional(),unit3:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit3')).max(1)}).optional(),unit4:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit4')).max(1)}).optional(),resetVersion:z.literal(1),nameConfirmed:z.boolean().optional().default(false),name:z.string().trim().min(1).max(30),step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.enum(['cake','lake','cape','book-unit1'])).max(4)});
 let payload;try{payload=await request.json()}catch{return Response.json({error:'잘못된 요청이에요.'},{status:400})}
 const parsed=schema.safeParse(payload);if(!parsed.success)return Response.json({error:'잘못된 진도예요.'},{status:400});const p=parsed.data;
 try{await getDatabase().prepare('INSERT INTO lesson_progress (user_id, name, name_confirmed, step, word, quiz, completed, homework, updated_at, unit2, unit3, unit4) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, name_confirmed=excluded.name_confirmed, step=excluded.step, word=excluded.word, quiz=excluded.quiz, completed=excluded.completed, homework=excluded.homework, updated_at=excluded.updated_at, unit2=excluded.unit2, unit3=excluded.unit3, unit4=excluded.unit4').bind(user.userId,p.name.trim(),p.nameConfirmed?1:0,p.step,p.word,p.quiz,p.completed?1:0,JSON.stringify([...new Set(p.homework)]),new Date().toISOString(),p.unit2?JSON.stringify(p.unit2):null,p.unit3?JSON.stringify(p.unit3):null,p.unit4?JSON.stringify(p.unit4):null).run();return Response.json({saved:true});}catch(e){console.error('Progress save failed',e);return unavailable();}
}
