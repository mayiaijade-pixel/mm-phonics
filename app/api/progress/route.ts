import {z} from 'zod';
import {getDatabase} from '../../../db';
import {getChatGPTUser} from '../../chatgpt-auth';
const unavailable=()=>Response.json({error:'진도를 저장할 수 없어요. 잠시 후 다시 시도해 주세요.'},{status:503});
export async function GET(){
 const user=await getChatGPTUser(); if(!user)return Response.json({error:'로그인이 필요해요.'},{status:401});
 try{const row=await getDatabase().prepare('SELECT name, step, word, quiz, completed, homework FROM lesson_progress WHERE user_id = ?').bind(user.userId).first();return Response.json({progress:row?{...row,homework:JSON.parse(String(row.homework)),completed:!!row.completed}:null});}catch(e){console.error('Progress read failed',e);return unavailable();}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요해요.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'요청을 확인해 주세요.'},{status:403});

 const schema=z.object({name:z.string().trim().min(1).max(30),step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.enum(['cake','lake','cape','book-unit1'])).max(4)});
 let payload;try{payload=await request.json()}catch{return Response.json({error:'잘못된 요청이에요.'},{status:400})}
 const parsed=schema.safeParse(payload);if(!parsed.success)return Response.json({error:'잘못된 진도예요.'},{status:400});const p=parsed.data;
 try{await getDatabase().prepare('INSERT INTO lesson_progress (user_id, name, step, word, quiz, completed, homework, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, step=excluded.step, word=excluded.word, quiz=excluded.quiz, completed=excluded.completed, homework=excluded.homework, updated_at=excluded.updated_at').bind(user.userId,p.name.trim(),p.step,p.word,p.quiz,p.completed?1:0,JSON.stringify([...new Set(p.homework)]),new Date().toISOString()).run();return Response.json({saved:true});}catch(e){console.error('Progress save failed',e);return unavailable();}
}
