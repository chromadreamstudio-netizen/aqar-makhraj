'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

interface Lead {
  id: string
  created_at: string
  compound_name: string
  phone_number: string
  original_price: number
  paid_amount: number
  requires_expat_service: boolean
  contract_image_url: string | null
  is_published: boolean
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setLeads(data || [])
    setIsLoading(false)
  }

  // دالة الاعتماد: تنقل الطلب لجدول العقارات المعتمدة وتغير حالته
  const handleApproveAndPublish = async (lead: Lead) => {
    const isConfirmed = window.confirm(`هل أنت متأكد من اعتماد ونشر عقار ${lead.compound_name}؟`)
    if (!isConfirmed) return

    // 1. إضافة العقار لجدول properties العام
    const { error: insertError } = await supabase.from('properties').insert([{
      lead_id: lead.id,
      compound_name: lead.compound_name,
      original_price: lead.original_price,
      paid_amount: lead.paid_amount
    }])

    if (insertError) {
      alert('حدث خطأ أثناء النشر')
      return
    }

    // 2. تحديث حالة الطلب في جدول leads
    await supabase.from('leads').update({ is_published: true }).eq('id', lead.id)
    
    alert('تم النشر بنجاح! العقار متاح الآن للمشترين.')
    fetchLeads() // تحديث الجدول
  }

  return (
    <main className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      <nav className="bg-slate-900 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl">م</div>
            <h1 className="font-bold text-2xl">غرفة العمليات | الاعتمادات</h1>
          </div>
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
            زيارة الموقع &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-r-emerald-500">
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي الطلبات (Leads)</p>
            <p className="text-3xl font-black text-slate-900">{leads.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-r-blue-500">
            <p className="text-sm font-bold text-slate-500 mb-1">طلبات بانتظار الاعتماد</p>
            <p className="text-3xl font-black text-amber-500">
              {leads.filter(l => !l.is_published).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-r-4 border-r-indigo-500">
            <p className="text-sm font-bold text-slate-500 mb-1">العقارات المنشورة</p>
            <p className="text-3xl font-black text-emerald-600">
              {leads.filter(l => l.is_published).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">إدارة طلبات البائعين</h2>
            <button onClick={fetchLeads} className="text-sm bg-white border px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-slate-50">🔄 تحديث</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">المجمع السكني</th>
                  <th className="p-4 font-bold">المطلوب كاش</th>
                  <th className="p-4 font-bold">المستندات</th>
                  <th className="p-4 font-bold">واتساب</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">جاري التحميل...</td></tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{lead.compound_name}</td>
                      <td className="p-4 font-black text-emerald-600">${lead.paid_amount?.toLocaleString() || 0}</td>
                      <td className="p-4">
                        {lead.contract_image_url ? (
                          <a href={lead.contract_image_url} target="_blank" className="text-blue-600 underline font-semibold">🔍 عرض العقد</a>
                        ) : <span className="text-slate-400">لم يُرفق</span>}
                      </td>
                      <td className="p-4">
                        <a href={`https://wa.me/${lead.phone_number.replace('+', '')}`} target="_blank" className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded font-bold">💬 تواصل</a>
                      </td>
                      <td className="p-4">
                        {lead.is_published ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">منشور بالسوق</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">قيد المراجعة</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {!lead.is_published && (
                          <button 
                            onClick={() => handleApproveAndPublish(lead)}
                            className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                          >
                            ✅ اعتماد ونشر
                          </button>
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
    </main>
  )
}