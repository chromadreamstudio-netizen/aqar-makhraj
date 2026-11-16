import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'عقار مَخْرَج | منصة التنازل الآمن',
  description: 'بيع وحدتك العقارية بدون خسارة وبسعر التعاقد القديم',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}