'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// واجهة تعريف نوع البيانات (TypeScript)
interface Lead {
  id: string
  created_at: string
  compound_name: string
  phone_number: string
  original_price: number
  paid_amount: number
  requires_expat_service: boolean
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // جلب البيانات من Supabase
  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false }) // الأحدث أولاً

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data || [])
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* شريط الإدارة العلوي */}
      <nav className="bg-slate-900 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl">م</div>
            <h1 className="font-bold text-2xl">غرفة العمليات | عقار مَخْرَج</h1>
          </div>
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-colors">
            زيارة الموقع &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-r-4 border-r-emerald-500">
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي الطلبات (Leads)</p>
            <p className="text-3xl font-black text-slate-900">{leads.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-r-4 border-r-blue-500">
            <p className="text-sm font-bold text-slate-500 mb-1">طلبات المغتربين</p>
            <p className="text-3xl font-black text-slate-900">
              {leads.filter(l => l.requires_expat_service).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-r-4 border-r-amber-500">
            <p className="text-sm font-bold text-slate-500 mb-1">إجمالي المبالغ المطلوب تسييلها</p>
            <p className="text-3xl font-black text-slate-900">
              ${leads.reduce((sum, lead) => sum + (lead.paid_amount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* جدول الطلبات */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">أحدث طلبات البائعين</h2>
            <button onClick={fetchLeads} className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 font-semibold transition-colors">
              🔄 تحديث البيانات
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="p-4 font-bold">التاريخ</th>
                  <th className="p-4 font-bold">المجمع السكني</th>
                  <th className="p-4 font-bold">المطلوب كاش</th>
                  <th className="p-4 font-bold">سعر العقد</th>
                  <th className="p-4 font-bold">المغتربين</th>
                  <th className="p-4 font-bold">رقم التواصل (واتساب)</th>
                  <th className="p-4 font-bold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                      لا توجد طلبات حتى الآن.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(lead.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{lead.compound_name}</td>
                      <td className="p-4 font-black text-emerald-600">${lead.paid_amount?.toLocaleString() || 0}</td>
                      <td className="p-4 font-semibold text-slate-600">${lead.original_price?.toLocaleString() || 0}</td>
                      <td className="p-4">
                        {lead.requires_expat_service ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">وكالة مصدقة</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800" dir="ltr">{lead.phone_number}</td>
                      <td className="p-4">
                        <a 
                          href={`https://wa.me/${lead.phone_number.replace('+', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-block"
                        >
                          💬 تواصل
                        </a>
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