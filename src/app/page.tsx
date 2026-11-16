'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [originalPrice, setOriginalPrice] = useState<number | ''>('')
  const [paidAmount, setPaidAmount] = useState<number | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [compound, setCompound] = useState('')
  const [isExpat, setIsExpat] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const remainingInstallments = typeof originalPrice === 'number' && typeof paidAmount === 'number' 
    ? originalPrice - paidAmount : 0

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    let uploadedFileUrl = null

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file)
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName)
        uploadedFileUrl = publicUrlData.publicUrl
      }
    }
    
    const { error } = await supabase.from('leads').insert([{ 
      phone_number: phone, compound_name: compound, original_price: originalPrice || null, 
      paid_amount: paidAmount || null, requires_expat_service: isExpat, contract_image_url: uploadedFileUrl 
    }])

    setIsSubmitting(false)
    if (!error) {
      setSubmitSuccess(true)
      const whatsappMsg = encodeURIComponent(`مرحباً عقار مخرج، سجلت وحدتي في مجمع ${compound} وأريد استكمال الإجراءات.`)
      setTimeout(() => {
        window.open(`https://wa.me/9647700000000?text=${whatsappMsg}`, '_blank')
        setIsModalOpen(false); setSubmitSuccess(false); setFile(null)
      }, 2000)
    } else {
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200" dir="rtl">
      
      {/* النافذة المنبثقة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-slate-100">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors text-xl font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            <h3 className="text-2xl font-extrabold mb-2 text-slate-900 text-center mt-2">سجل بياناتك للبدء</h3>
            <p className="text-center text-slate-500 text-sm mb-6">خطوتك الأولى نحو الخروج الآمن بدون خسائر</p>
            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center font-bold text-lg">
                🎉 تم استلام طلبك بنجاح!<br/><span className="text-sm font-normal mt-2 block">جاري تحويلك للواتساب للتواصل المباشر...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم المجمع السكني (أو المشروع)</label>
                  <input required type="text" value={compound} onChange={(e) => setCompound(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium" placeholder="مثال: بوابة العراق" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الواتساب للتواصل</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium" dir="ltr" placeholder="+964..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">إرفاق المستندات (اختياري حالياً)</label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:bg-slate-50 transition-colors group cursor-pointer text-center">
                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-emerald-600 transition-colors">
                      {file ? `✓ ${file.name}` : '📁 اضغط هنا لرفع صورة العقد أو الوصولات'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <input type="checkbox" id="expat" checked={isExpat} onChange={(e) => setIsExpat(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded border-slate-300" />
                  <label htmlFor="expat" className="text-sm font-bold text-slate-700 cursor-pointer">أنا خارج العراق (أحتاج خدمة التحويل بالوكالة)</label>
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-lg py-4 rounded-xl mt-6 transition-all shadow-lg hover:shadow-emerald-500/30">
                  {isSubmitting ? 'جاري تأمين بياناتك...' : 'إرسال والتحويل للواتساب'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* شريط التنقل - تم إضافة زر دخول الشركات */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-40 h-14"><Image src="/logo.jpg" alt="Logo" fill className="object-contain mix-blend-multiply" priority /></div>
            </Link>
            <div className="hidden md:flex items-center gap-10 px-6">
              <button onClick={() => setIsModalOpen(true)} className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">عرض وحدتك للبيع</button>
              <Link href="/opportunities" className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">تصفح الفرص المتاحة</Link>
              <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">كيف بنشتغل؟</a>
              {/* رابط بوابة الشركات الجديد */}
              <Link href="/b2b" className="text-slate-500 hover:text-blue-600 font-bold transition-colors border-r-2 border-slate-200 pr-6">بوابة الشركات</Link>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">ابدأ الآن</button>
          </div>
        </div>
      </nav>

      {/* القسم الأول: الهيرو التسويقي */}
      <section className="bg-white py-20 border-b border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 skew-x-12 -z-10 transform origin-top-right"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <span className="inline-block px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-bold tracking-wide shadow-sm">
              🚀 منصة التنازل العقاري الأولى في العراق
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              طرف محتاج يبيع، <br/>
              <span className="text-emerald-600">وطرف يدوّر على فرصة..</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium px-4">
              ده مش ريسيل عادي! البائع يرجعله كل الفلوس اللي دفعها كاش بدون غرامات شركة، والمشتري ياخد العقار بنفس السعر القديم ويكمل الأقساط.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 px-10 rounded-2xl text-lg transition-all shadow-xl hover:shadow-2xl">
                عندي وحدة أريد أبيعها
              </button>
              <Link href="/opportunities" className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold py-4 px-10 rounded-2xl text-lg transition-all shadow-sm">
                أريد أشتري فرصة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* القسم الثاني: مثال بالأرقام */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">مثال حقيقي بالأرقام</h2>
            <p className="text-xl text-slate-600 font-medium">عقار سعره الإجمالي 150 مليون، صاحبه دافع 40 مليون ومتوقف عن السداد.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* حالة الإلغاء مع المطور (الخسارة) */}
            <div className="bg-white rounded-3xl p-10 shadow-lg border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xl">✕</div>
                <h3 className="text-2xl font-bold text-slate-900">لو رجّع الوحدة للشركة المطورّة</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex justify-between items-center text-lg">
                  <span className="text-slate-600 font-medium">خصم الإلغاء (15% من سعر الوحدة كله)</span>
                  <span className="font-black text-red-600">- 22,500,000 د.ع</span>
                </li>
                <li className="flex justify-between items-center text-lg pt-6 border-t border-slate-100">
                  <span className="text-slate-900 font-bold">اللي يرجعله بعد شهور من الانتظار</span>
                  <span className="font-black text-slate-900 text-2xl">17,500,000 د.ع</span>
                </li>
              </ul>
              <div className="mt-8 bg-red-50 text-red-700 p-4 rounded-xl text-center font-bold">
                خسارة أكثر من نصف أمواله + انتظار طويل!
              </div>
            </div>

            {/* حالة عقار مخرج (المكسب) */}
            <div className="bg-slate-900 rounded-3xl p-10 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xl">✓</div>
                <h3 className="text-2xl font-bold text-white">لو نقل تعاقده عن طريق عقار مَخْرَج</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex justify-between items-center text-lg">
                  <span className="text-slate-300 font-medium">يسترجع كل اللي دفعه</span>
                  <span className="font-black text-emerald-400 text-2xl">40,000,000 د.ع</span>
                </li>
                <li className="flex justify-between items-center text-lg pt-6 border-t border-slate-700">
                  <span className="text-slate-300 font-medium">عمولة المنصة على البائع</span>
                  <span className="font-black text-white text-2xl">صـفـر (0%)</span>
                </li>
              </ul>
              <div className="mt-8 bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-center font-bold">
                فلوسه ترجعله كاملة كاش، والمشتري يكسب سعر قديم!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* القسم الثالث: معايير الخروج العادل */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">معايير الخروج العادل</h2>
            <p className="text-xl text-slate-500 font-medium">وضعنا قواعد ملزمة لنفسنا قبل ما نطلبك تثق فينا.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🛡️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">كل رقم له مصدر</h3>
              <p className="text-slate-600 leading-relaxed font-medium">نوضّحلك إيه المؤكد بالمستندات والوصولات الرسمية وإيه التقديري، من غير وعود مضللة أو أرقام وهمية.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">💎</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">مجاناً للبائع بالكامل</h3>
              <p className="text-slate-600 leading-relaxed font-medium">مفيش أي عمولة على البائع المتعثر خالص. المشتري فقط هو من يدفع عمولة رمزية عند إتمام التنازل رسمياً.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🤫</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">خصوصيتك محفوظة</h3>
              <p className="text-slate-600 leading-relaxed font-medium">نظام "الخروج الصامت". مفيش اسمك ولا تليفونك بينزل على الموقع، مفيش إزعاج، إحنا اللي بندير التفاوض.</p>
            </div>
          </div>
        </div>
      </section>

      {/* القسم الرابع: الحاسبة الذكية */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black mb-4">مش قادر تكمّل أقساطك؟</h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                متتسرعش في قرار الإلغاء. اعرف موقفك المالي في ثواني مجاناً ومن غير أي التزام. سجل أرقامك والمنظومة هتحسبلك كل حاجة.
              </p>
            </div>
            
            <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-700">
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3">سعر العقد الأصلي الإجمالي</label>
                  <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 font-medium text-lg" placeholder="مثال: 150000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3">إجمالي ما دفعته للشركة حتى اليوم</label>
                  <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 font-medium text-lg" placeholder="مثال: 40000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center mb-8">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
                  <p className="text-sm font-bold text-slate-400 mb-2">تسترجع كاش</p>
                  <p className="text-3xl font-black text-emerald-400">{paidAmount ? paidAmount.toLocaleString() : '0'}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
                  <p className="text-sm font-bold text-slate-400 mb-2">متبقي أقساط</p>
                  <p className="text-3xl font-black text-blue-400">{remainingInstallments > 0 ? remainingInstallments.toLocaleString() : '0'}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-5 rounded-xl text-lg transition-colors shadow-lg">
                أريد بيع وحدتي بهذه الأرقام
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* القسم الخامس: جدول المقارنة */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">إيه الفرق بينا وبين السوق العادي؟</h2>
            <p className="text-xl text-slate-500 font-medium">السوق مليان إعلانات وسماسرة — إحنا بنشتغل بطريقة تانية خالص.</p>
          </div>
          
          <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-200 bg-white">
            <table className="w-full text-right">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-6 font-bold text-lg border-l border-slate-700 w-1/4">المقارنة</th>
                  <th className="p-6 font-bold text-xl border-l border-slate-700 w-2/5 text-emerald-400">عقار مَخْرَج</th>
                  <th className="p-6 font-bold text-lg w-2/5">الريسيل العادي (الدلالين)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-6 font-bold text-slate-800 bg-slate-50 border-l border-slate-100">السعر</td>
                  <td className="p-6 text-slate-900 font-bold border-l border-slate-100"><span className="text-emerald-500 ml-2 text-xl">✓</span>بدون فرق (أوفر) وهمي. السعر = اللي اتدفع فعلاً</td>
                  <td className="p-6 text-slate-600 font-medium"><span className="text-red-400 ml-2 text-xl">✕</span>مبالغة في السرقفلية والأسعار عشان الفصال</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-6 font-bold text-slate-800 bg-slate-50 border-l border-slate-100">المستندات</td>
                  <td className="p-6 text-slate-900 font-bold border-l border-slate-100"><span className="text-emerald-500 ml-2 text-xl">✓</span>متحققين من العقد والوصولات الرسمية</td>
                  <td className="p-6 text-slate-600 font-medium"><span className="text-red-400 ml-2 text-xl">✕</span>كلام مرسل بين البائع والسمسار من غير دليل</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-6 font-bold text-slate-800 bg-slate-50 border-l border-slate-100">الإجراءات</td>
                  <td className="p-6 text-slate-900 font-bold border-l border-slate-100"><span className="text-emerald-500 ml-2 text-xl">✓</span>بنمشي معاك خطوة بخطوة لحد التوقيع بمقر المطور</td>
                  <td className="p-6 text-slate-600 font-medium"><span className="text-red-400 ml-2 text-xl">✕</span>السمسار يوصلك بالبائع ويسيبك تتعامل لوحدك</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-6 font-bold text-slate-800 bg-slate-50 border-l border-slate-100">العمولة</td>
                  <td className="p-6 text-slate-900 font-bold border-l border-slate-100"><span className="text-emerald-500 ml-2 text-xl">✓</span>صفر على البائع! وعمولة بسيطة للمشتري عند الإتمام</td>
                  <td className="p-6 text-slate-600 font-medium"><span className="text-red-400 ml-2 text-xl">✕</span>عمولة مبالغ فيها من الطرفين (البائع والمشتري)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* القسم السادس: كيف بنشتغل (الخطوات) */}
      <section id="how-it-works" className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">إزاي بنشتغل؟</h2>
            <p className="text-xl text-slate-500 font-medium">خمس خطوات واضحة، ومسؤول حالة معاك في كل خطوة.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '1', title: 'قيّم عقدك', desc: 'دخل بيانات عقدك واعرف موقفك المالي مجاناً وفي ثواني عبر المنصة.' },
              { num: '2', title: 'ارفع مستنداتك', desc: 'صور العقد وإيصالات السداد عشان فريقنا يراجعها ويعتمد الفرصة.' },
              { num: '3', title: 'بنجّهز فرصتك', desc: 'بنتأكد من الأرقام ونعرضها بشكل احترافي سري للمستثمرين.' },
              { num: '4', title: 'بنلاقي المشتري', desc: 'بنطابق وحدتك مع مستثمرين جاهزين وعندهم الكاش الفعلي.' },
              { num: '5', title: 'نقل التعاقد', desc: 'بنمشي معاك في إجراءات النقل داخل الشركة لحد ما تقبض كاش.' }
            ].map((step, index) => (
              <div key={index} className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-md">{step.num}</div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* الفوتر الشامل */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">م</div>
                <span className="font-black text-3xl text-white tracking-tight">عقار مَخْرَج</span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                منصة التنازل عن العقارات ووحدات التقسيط المتعثرة في العراق. البائع يسترجع فلوسه، والمشتري يربح السعر القديم بكل شفافية وأمان.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-xl">المنصة</h4>
              <ul className="space-y-4 font-medium">
                <li><Link href="/" className="hover:text-emerald-400 transition-colors">الرئيسية</Link></li>
                <li><Link href="/opportunities" className="hover:text-emerald-400 transition-colors">الفرص المتاحة (للمشترين)</Link></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">كيف بنشتغل (للبائعين)</a></li>
                {/* رابط الفوتر تم تحديثه هنا 👇 */}
                <li><Link href="/b2b" className="hover:text-emerald-400 transition-colors text-blue-400 font-bold">بوابة المطورين العقاريين</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-xl">قانوني</h4>
              <ul className="space-y-4 font-medium">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">معايير التحقق والضمانات</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">خدمة المغتربين (الوكالات)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-xl">تواصل معنا</h4>
              <ul className="space-y-5 font-medium text-slate-300">
                <li className="flex items-start gap-4">
                  <span className="text-emerald-500 text-xl">📞</span> 
                  <span dir="ltr" className="font-bold text-lg text-white">+964 770 000 0000</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-emerald-500 text-xl">✉️</span> 
                  <span>info@aqarmakhraj.iq</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-emerald-500 text-xl">📍</span> 
                  <span className="leading-relaxed">العراق - بغداد<br/>المنصور، شارع الرواد</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm font-medium text-slate-500 flex flex-col md:flex-row justify-between items-center">
            <p>جميع الحقوق محفوظة © 2026 شركة عقار مخرج ذ.م.م.</p>
            <p className="mt-4 md:mt-0 bg-slate-800 px-4 py-2 rounded-lg text-slate-300">صُنع بكل فخر في العراق 🇮🇶</p>
          </div>
        </div>
      </footer>

    </main>
  )
}