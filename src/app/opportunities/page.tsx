'use client'

import Link from 'next/link'

export default function Opportunities() {
  // بيانات افتراضية لعرض شكل الفرص للمشترين
  const dummyProperties = [
    { id: 1, compound: 'بوابة العراق', originalPrice: 150000, paid: 40000, remaining: 110000, location: 'بغداد' },
    { id: 2, compound: 'مجمع بسماية', originalPrice: 80000, paid: 25000, remaining: 55000, location: 'بغداد' },
    { id: 3, compound: 'اليرموك سيتي', originalPrice: 200000, paid: 80000, remaining: 120000, location: 'أربيل' },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* شريط علوي بسيط */}
      <nav className="bg-slate-900 text-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-2xl text-emerald-400">الفرص المتاحة</h1>
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">
            العودة للرئيسية &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">اقتنص فرصتك الآن</h2>
          <p className="text-slate-600 mt-2">عقارات بسعر الطرح القديم، ادفع الكاش للبائع وأكمل الأقساط مع الشركة.</p>
        </div>

        {/* شبكة عرض العقارات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyProperties.map((prop) => (
            <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              
              <div className="bg-slate-100 p-6 border-b border-slate-200">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-3">
                  {prop.location}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{prop.compound}</h3>
                <p className="text-slate-500 text-sm mt-1">السعر الأصلي: {prop.originalPrice.toLocaleString()}$</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">المطلوب كاش (للبائع)</span>
                  <span className="text-xl font-extrabold text-emerald-600">{prop.paid.toLocaleString()}$</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">المتبقي أقساط (للشركة)</span>
                  <span className="text-xl font-extrabold text-blue-600">{prop.remaining.toLocaleString()}$</span>
                </div>
                
                <button className="w-full mt-6 bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors">
                  طلب شراء / تفاصيل
                </button>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}