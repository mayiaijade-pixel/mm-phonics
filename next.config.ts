import type {NextConfig} from 'next';
import path from 'node:path';
const nextConfig:NextConfig={
 distDir:process.env.MM_HOSTING_TARGET==='sites'||process.env.VERCEL==='1'?'.next':'.next-vercel',
 env:{NEXT_PUBLIC_HOSTING_PLATFORM:process.env.MM_HOSTING_TARGET==='sites'?'sites':'vercel'},
 webpack(config){
  config.resolve.alias={...config.resolve.alias,
   '@platform/key':path.resolve(process.env.MM_HOSTING_TARGET==='sites'?'platform/sites/key.ts':'platform/vercel/key.ts'),
   '@platform/auth':path.resolve(process.env.MM_HOSTING_TARGET==='sites'?'app/chatgpt-auth.ts':'platform/vercel/auth.ts'),
   '@platform/progress':path.resolve(process.env.MM_HOSTING_TARGET==='sites'?'platform/sites/progress.ts':'platform/vercel/progress.ts'),
   '@platform/mimi-voice':path.resolve(process.env.MM_HOSTING_TARGET==='sites'?'platform/sites/mimi-voice.ts':'platform/vercel/mimi-voice.ts')};
  return config;
 }
};
export default nextConfig;
