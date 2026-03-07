import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '阿娟蛋的博客',
  description: '个人技术博客',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
