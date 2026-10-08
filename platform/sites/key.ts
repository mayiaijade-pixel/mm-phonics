import {env} from 'cloudflare:workers';
export const speechKey=()=>(env as unknown as Record<string,string>).ELEVENLABS_API_KEY;
