import {env} from 'cloudflare:workers';
import {classRequest} from '../../lib/angel-class/server';
export function handle(request:Request,endpoint:string){const runtime=env as Cloudflare.Env&Record<string,unknown>;return classRequest(request,{db:runtime.DB!,bucket:runtime.BUCKET!,secret:String(runtime.ANGEL_CLASS_SECRET||''),password:String(runtime.ANGEL_CLASS_PASSWORD||''),teacherPassword:runtime.ANGEL_TEACHER_PASSWORD?String(runtime.ANGEL_TEACHER_PASSWORD):undefined},endpoint)}
