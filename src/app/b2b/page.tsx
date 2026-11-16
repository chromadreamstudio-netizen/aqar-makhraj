'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

interface Lead {
  id: string
  created_at: string
  compound_name: string
  original_price: number
  paid_amount: number
  phone_number: string
  is_published: boolean
}

export default function B2BPortal() {
  const [session, setSession] = useState<any>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // حالات تسجيل الدخول
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // حالات لوحة التحكم (Dashboard)
  const [leads, setLeads] = useState<Lead[]>([])
  const [isAdding, setIsAdding] = useState(false)
  
  // نموذج إضافة عميل جديد
  const [newCompound, setNewCompound] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | ''>('')
  const [newPaidAmount, setNewPaidAmount] = useState<number | ''>('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    if (session) fetchDeveloperLeads(session.user.id)
    setIsLoadingAuth(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError('بيانات الدخول غير صحيحة للشركة.')
    } else {
      setSession(data.session)
      fetchDeveloperLeads(data.session.user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const fetchDeveloperLeads = async (developerId: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('developer_id', developerId)
      .order('created_at', { ascending: false })
    if (!error) setLeads(data || [])
  }

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    const { error } = await supabase.from('leads').insert([{
      developer_id: session.user.id,
      compound_name: newCompound,
      phone_number: newPhone,
      original_price: newOriginalPrice || null,
      paid_amount: newPaidAmount || null,
      is_published: false // يحتاج اعتماد من الإدارة العامة
    }])
    
    setIsAdding(false)
    if (error) {
      alert('حدث خطأ أثناء إضافة العميل.')
    } else {
      alert('تم إرسال العميل بنجاح للإدارة لاعتماده.')
      setNewCompound('')
      setNewPhone('')
      setNewOriginalPrice('')
      setNewPaidAmount('')
      fetchDeveloperLeads(session.user.id)
    }
  }

  if (isLoadingAuth) return <div className="min-h-screen bg-slate-50"></div>

  // ---------------- شاشة تسجيل الدخول للشركات ----------------
  if (!session) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">B2B</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">بوابة المطورين العقاريين</h1>
            <p className="text-slate-500 text-sm mt-2">تسجيل دخول الشركات لرفع العملاء المتعثرين</p>
          </div>

          {authError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6 text-center">{authError}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني للشركة</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-600 text-left" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-600 text-left" dir="ltr" />
            </div>
            <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-4">
              تسجيل دخول الشركات
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 font-semibold">&larr; العودة للموقع الرئيسي</Link>
          </div>
        </div>
      </main>
    )
  }

  // ---------------- لوحة تحكم الشركة (Dashboard) ----------------
  return (
    <main className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* شريط المطورين */}
      <nav className="bg-blue-900 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white text-blue-900 rounded-lg flex items-center justify-center font-black text-xl">B2B</div>
            <h1 className="font-bold text-xl md:text-2xl">بوابة شركاء النجاح (المطورين)</h1>
          </div>
          <button onClick={handleLogout} className="bg-blue-800 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            تسجيل الخروج
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* العمود الجانبي: إضافة عميل متعثر جديد */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
            <h2 className="text-xl font-black text-slate-800 mb-2">إضافة عميل متعثر</h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">سيتم تحويل العميل للمنصة لإيجاد مشتري بديل بسرية تامة.</p>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">المجمع / المشروع</label>
                <input required type="text" value={newCompound} onChange={e => setNewCompound(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">هاتف العميل</label>
                <input required type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl text-left outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">سعر الوحدة الأصلي</label>
                <input required type="number" value={newOriginalPrice} onChange={e => setNewOriginalPrice(Number(e.target.value))} className="w-full bg-slate-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ما سدده العميل كاش</label>
                <input required type="number" value={newPaidAmount} onChange={e => setNewPaidAmount(Number(e.target.value))} className="w-full bg-slate-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button disabled={isAdding} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-2 transition-colors">
                {isAdding ? 'جاري الإرسال...' : 'إرسال للإدارة واعتماد'}
              </button>
            </form>
          </div>
        </div>

        {/* العمود الرئيسي: جدول العملاء المرفوعين مسبقاً */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">سجل عملائك المتعثرين</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{leads.length} عقود</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-100 text-slate-600 text-sm">
                  <tr>
                    <th className="p-4 font-bold">المشروع</th>
                    <th className="p-4 font-bold">المدفوع كاش</th>
                    <th className="p-4 font-bold">المتبقي للشركة</th>
                    <th className="p-4 font-bold">حالة الفرصة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {leads.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-semibold">لم تقم برفع أي عملاء بعد.</td></tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{lead.compound_name}</td>
                        <td className="p-4 font-black text-emerald-600">${lead.paid_amount.toLocaleString()}</td>
                        <td className="p-4 font-black text-blue-600">${(lead.original_price - lead.paid_amount).toLocaleString()}</td>
                        <td className="p-4">
                          {lead.is_published ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">مُباع / منشور</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">جاري البحث عن مشتري</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}