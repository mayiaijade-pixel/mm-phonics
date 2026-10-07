import {cookies} from 'next/headers';
export async function getChatGPTUser(){
 const id=(await cookies()).get('mimi-session')?.value;
 return id?{userId:id,displayName:'Student',email:'',fullName:null}:null;
}
export async function requireChatGPTUser(_returnTo:string){return {userId:'browser',displayName:'Student',email:'',fullName:null};}
