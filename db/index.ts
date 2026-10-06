import { env } from 'cloudflare:workers';
export function getDatabase(){ if(!env.DB) throw new Error('Progress database unavailable'); return env.DB; }
