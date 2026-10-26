const productionBase='https://mimi-magic-e-jenny.aiplane-jade.chatgpt.site';
export async function handle(request:Request,endpoint:string){
 if(!['session','state','action'].includes(endpoint))return Response.json({error:'영상 링크를 다시 열어 주세요.'},{status:404});
 if(request.method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'요청을 확인해 주세요.'},{status:403});
 const base=process.env.ANGEL_CLASS_API_BASE||productionBase;
 try{const headers=new Headers({'Content-Type':'application/json','Origin':new URL(request.url).origin});headers.set('Cookie',(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith('angel-class=')).join(';'));
 const text=request.method==='GET'?undefined:await request.text();if(text&&text.length>16000)return Response.json({error:'항목 내용이 너무 길어요.'},{status:413});
 const upstream=await fetch(`${base}/api/angel-class/${endpoint}`,{method:request.method,headers,body:text,cache:'no-store',signal:AbortSignal.timeout(30000),redirect:'error'});
 const outgoing=new Headers({'Content-Type':'application/json','Cache-Control':'no-store'});const cookie=upstream.headers.getSetCookie().find(value=>value.startsWith('angel-class='));if(cookie)outgoing.set('set-cookie',cookie);return new Response(upstream.body,{status:upstream.status,headers:outgoing});
 }catch{return Response.json({error:'Angel class에 연결하지 못했어요. 다시 시도해 주세요.'},{status:503})}
}
