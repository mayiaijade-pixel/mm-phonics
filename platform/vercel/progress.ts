import {cookies} from 'next/headers';
import {z} from 'zod';
const schema=z.object({unit2:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit2')).max(1)}).optional(),unit3:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit3')).max(1)}).optional(),unit4:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit4')).max(1)}).optional(),unit5:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit5')).max(1)}).optional(),unit6:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit6')).max(1)}).optional(),unit7:z.object({step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.literal('book-unit7')).max(1)}).optional(),resetVersion:z.literal(1),nameConfirmed:z.boolean(),name:z.string().trim().min(1).max(30),step:z.number().int().min(0).max(7),word:z.number().int().min(0).max(7),quiz:z.number().int().min(0).max(3),completed:z.boolean(),homework:z.array(z.enum(['cake','lake','cape','book-unit1'])).max(4)});
export async function GET(){
 const value=(await cookies()).get('mimi-progress-v1')?.value;
 try{const parsed=schema.safeParse(JSON.parse(Buffer.from(value||'','base64url').toString('utf8')));return Response.json({progress:parsed.success?parsed.data:null},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({progress:null},{headers:{'Cache-Control':'no-store'}})}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'잘못된 요청이에요.'},{status:403});
 const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:'잘못된 진도예요.'},{status:400});
 (await cookies()).set('mimi-progress-v1',Buffer.from(JSON.stringify(parsed.data)).toString('base64url'),{httpOnly:true,secure:new URL(request.url).protocol==='https:',sameSite:'lax',path:'/',maxAge:60*60*24*365});
 return Response.json({saved:true});
}
