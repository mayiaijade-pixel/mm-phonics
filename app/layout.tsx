import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mimi’s Phonics · Magic e',description:'하얀 고양이 미미와 함께 배우는 첫 번째 파닉스 수업. Long vowel a와 magic e를 만나보세요.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
