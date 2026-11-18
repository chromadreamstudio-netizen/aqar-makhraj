'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

interface Property {
  id: string
  compound_name: string
  original_price: number
  paid_amount: number
  created_at: string
}

export default function Opportunities() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setProperties(data || [])
    setIsLoading(false)
  }

  // الدالة الجديدة لزر "طلب شراء" (تحويل فوري للواتساب مع رسالة جاهزة)
  const handleBuyRequest = (compoundName: string) => {
    const whatsappNumber = "9647726394755" // رقم هاتف الشريك
    const message = encodeURIComponent(`مرحباً عقار مخرج، أنا مستثمر جاهز ومهتم باقتناص الفرصة المعروضة في مجمع (${compoundName}). أرجو تزويدي بالتفاصيل وآلية الدفع.`)
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      <nav className="bg-slate-900 text-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-sm">م</div>
             <h1 className="font-bold text-xl text-white">الفرص المتاحة (معتمدة)</h1>
          </div>
          <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm font-semibold border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800">
            العودة للرئيسية &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4">موثقة ومراجعة قانونياً</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">اقتنص فرصتك الآن</h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto text-lg">عقارات بسعر الطرح القديم، ادفع الكاش للبائع وأكمل الأقساط مع الشركة بضمان قانوني كامل.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-lg font-semibold">لا توجد فرص متاحة في الوقت الحالي.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => {
              const remaining = (prop.original_price || 0) - (prop.paid_amount || 0)
              return (
                <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-slate-50 p-6 border-b border-slate-100 relative">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-3">فرصة نشطة</span>
                    <h3 className="text-xl font-bold text-slate-800">{prop.compound_name}</h3>
                    <p className="text-slate-500 text-sm mt-2 font-medium">السعر الأصلي: ${(prop.original_price || 0).toLocaleString()}</p>
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
                    
                    <button 
                      onClick={() => handleBuyRequest(prop.compound_name)}
                      className="w-full mt-6 bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors shadow-md"
                    >
                      طلب شراء / تفاصيل
                    </button>
                    
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* سد ثغرة فقدان المشتري: نموذج تسجيل الطلب الخاص */}
        <div className="mt-20 bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4 relative z-10">لم تجد الفرصة المناسبة لميزانيتك؟</h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
            سوق العقارات يتحرك بسرعة، وأفضل الفرص تُباع وتُحجز قبل نشرها على المنصة. سجل طلبك الخاص وسيقوم فريقنا بالبحث وتوفير العرض المناسب لك سراً خلال 48 ساعة.
          </p>
          <button 
            onClick={() => {
              const msg = encodeURIComponent('مرحباً، أبحث عن فرصة استثمارية بمواصفات معينة (المجمع/الميزانية) ولم أجدها في الموقع. أرجو المساعدة بتوفيرها.')
              window.open(`https://wa.me/9647726394755?text=${msg}`, '_blank')
            }} 
            className="relative z-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg border border-emerald-500"
          >
            سجل طلبك (خدمة الاستثمار VIP)
          </button>
        </div>
      </div>
    </main>
  )
}