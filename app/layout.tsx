import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mimi’s Phonics · Magic e',description:'하얀 고양이 미미와 함께 배우는 첫 번째 파닉스 수업. Long vowel a와 magic e를 만나보세요.',applicationName:'Mimi’s Phonics',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Mimi Phonics',statusBarStyle:'default'},icons:{icon:[{url:'/icons/mimi-32-v1.png',sizes:'32x32',type:'image/png'},{url:'/icons/mimi-192-v1.png',sizes:'192x192',type:'image/png'}],apple:[{url:'/icons/mimi-180-v1.png',sizes:'180x180',type:'image/png'}],shortcut:'/icons/mimi-32-v1.png'}};
export const viewport:Viewport={themeColor:'#7845cf',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
