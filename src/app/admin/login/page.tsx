'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور.')
      setIsLoading(false)
    } else {
      // نجاح الدخول -> التوجيه لغرفة العمليات
      router.push('/admin')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-emerald-400">م</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">تسجيل الدخول للإدارة</h1>
          <p className="text-slate-500 text-sm mt-2">عقار مَخْرَج - غرفة العمليات</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-left" 
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-left" 
              dir="ltr"
            />
          </div>
          <button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-4"
          >
            {isLoading ? 'جاري التحقق...' : 'دخول آمـن'}
          </button>
        </form>
      </div>
    </main>
  )
}