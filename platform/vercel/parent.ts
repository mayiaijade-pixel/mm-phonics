import {cookies} from 'next/headers';
import {parentAction,parentInput,parentView,type ParentRecord} from '../../lib/parent';
const cookieName='mimi-parent-v1';
const encoder=new TextEncoder();
async function key(){const secret=process.env.MIMI_PARENT_SECRET;if(!secret||secret.length<32)throw Error('Parent configuration unavailable');return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',encoder.encode(secret)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function sealParent(record:ParentRecord,secretKey?:CryptoKey){const iv=crypto.getRandomValues(new Uint8Array(12));const body=await crypto.subtle.encrypt({name:'AES-GCM',iv},secretKey||await key(),encoder.encode(JSON.stringify(record)));return Buffer.concat([Buffer.from(iv),Buffer.from(body)]).toString('base64url')}
export async function openParent(value:string,secretKey?:CryptoKey):Promise<ParentRecord>{const bytes=Buffer.from(value,'base64url');const json=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(0,12)},secretKey||await key(),bytes.subarray(12));return JSON.parse(new TextDecoder().decode(json))}
async function read(){const value=(await cookies()).get(cookieName)?.value;return value?await openParent(value):null}
export async function GET(){try{await key();return Response.json(parentView(await read()),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'부모 설정을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'},{status:503})}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'요청을 확인해 주세요.'},{status:403});
 const parsed=parentInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return Response.json({error:'비밀번호(8자 이상)와 보상 내용 길이(최대 12개)를 확인해 주세요.'},{status:400});
 try{const result=await parentAction(await read(),parsed.data);if(result.record)(await cookies()).set(cookieName,await sealParent(result.record),{httpOnly:true,secure:new URL(request.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:31536000});return Response.json(result.error?{error:result.error}:parentView(result.record),{status:result.status,headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'부모 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'},{status:503})}
}
