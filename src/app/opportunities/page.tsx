'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

// تعريف هيكل البيانات القادمة من قاعدة البيانات
interface Opportunity {
  id: string
  compound_name: string
  original_price: number
  paid_amount: number
  created_at: string
}

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // سحب البيانات من Supabase عند تحميل الصفحة
  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('id, compound_name, original_price, paid_amount, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching opportunities:', error)
    } else {
      setOpportunities(data || [])
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* شريط علوي بسيط */}
      <nav className="bg-slate-900 text-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-sm">م</div>
             <h1 className="font-bold text-xl text-white">الفرص المتاحة</h1>
          </div>
          <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm font-semibold border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800">
            العودة للرئيسية &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4">يتم التحديث لحظياً</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">اقتنص فرصتك الآن</h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto text-lg">
            عقارات بسعر الطرح القديم، ادفع الكاش للبائع وأكمل الأقساط مع الشركة بضمان قانوني كامل.
          </p>
        </div>

        {/* شبكة عرض العقارات */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-lg font-semibold">لا توجد فرص متاحة في الوقت الحالي.</p>
            <p className="text-slate-400 mt-2">يرجى العودة لاحقاً أو متابعة إشعاراتنا.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((prop) => {
              const remaining = (prop.original_price || 0) - (prop.paid_amount || 0)
              
              return (
                <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  
                  <div className="bg-slate-50 p-6 border-b border-slate-100 relative">
                    <div className="absolute top-4 left-4">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-3">
                      فرصة نشطة
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{prop.compound_name}</h3>
                    <p className="text-slate-500 text-sm mt-2 font-medium">السعر الأصلي: ${(prop.original_price || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      نُشر في: {new Date(prop.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <span className="text-slate-600 font-semibold">المطلوب كاش (للبائع)</span>
                      <span className="text-2xl font-black text-emerald-600">${(prop.paid_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-semibold">المتبقي أقساط (للشركة)</span>
                      <span className="text-2xl font-black text-blue-600">${remaining > 0 ? remaining.toLocaleString() : 0}</span>
                    </div>
                    
                    <button className="w-full mt-6 bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors shadow-md">
                      طلب شراء / تفاصيل
                    </button>
                  </div>
                  
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}