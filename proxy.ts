import {NextRequest,NextResponse} from 'next/server';
export function proxy(request:NextRequest){
 const response=NextResponse.next();
 if(!request.cookies.get('mimi-session'))response.cookies.set('mimi-session',crypto.randomUUID(),{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:60*60*24*365});
 return response;
}
export const config={matcher:['/','/api/:path*']};
