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
        window.open(`https://wa.me/9647726394755?text=${whatsappMsg}`, '_blank')
        setIsModalOpen(false); setSubmitSuccess(false); setFile(null)
      }, 2000)
    } else {
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    }
  }

  const FloatingWhatsApp = () => {
    return (
      <a 
        href="https://wa.me/9647726394755" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 bg-slate-900 text-white rounded-full flex items-center justify-center p-4 shadow-2xl hover:bg-slate-800 transition-colors z-50 group border border-slate-700"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
             <span className="text-sm font-bold block">اسأل عقار مَخْرَج</span>
             <span className="text-xs text-emerald-400">نرد بثواني</span>
          </div>
          <span className="text-2xl">💬</span>
        </div>
      </a>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200" dir="rtl">
      <FloatingWhatsApp />

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

      {/* شريط التنقل المتوافق مع الهوية العراقية */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* الشعار في الهيدر */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-40 h-16"><Image src="/logo.jpg" alt="عقار مخرج" fill className="object-contain mix-blend-multiply" priority /></div>
            </Link>
            <div className="hidden md:flex items-center gap-8 px-6 text-sm">
              <button onClick={() => setIsModalOpen(true)} className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">عرض وحدتك</button>
              <Link href="/opportunities" className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">الفرص المتاحة</Link>
              <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">شلون نشتغل</a>
              <a href="#story" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">قصتنا</a>
              <a href="#contact" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">تواصل معنا</a>
              <Link href="/b2b" className="text-slate-500 hover:text-blue-600 font-bold transition-colors border-r-2 border-slate-200 pr-6">بوابة المطورين</Link>
            </div>
            <div className="flex gap-2">
                <Link href="/opportunities" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-all hidden sm:block">أريد أشتري</Link>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md transition-all">أريد أبيع</button>
            </div>
          </div>
        </div>
      </nav>

      {/* القسم الأول: الهيرو التسويقي */}
      <section className="bg-slate-900 py-24 overflow-hidden relative text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8 order-2 lg:order-1 text-center lg:text-right">
              <span className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold tracking-wide border border-slate-700">
                منصة التنازل عن وحدات التقسيط — بدون أوفر (سرقفلية)
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.2] tracking-tight">
                البائع يسترجع كل اللي دفعه كاش، <br/>
                <span className="text-emerald-400">والمشتري ياخذ السعر القديم</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
                إذا ما تقدر تكمّل أقساطك: بيع وحدتك بدون سرقفلية واسترجع فلوسك، بدل ما تخاطر بخسارة كبيرة من قيمة العقد بسبب غرامات الإلغاء. وإذا تدور على فرصة: اشتري بسعر تعاقد قديم وتجنب غلاء السوق وكمّل الأقساط براحتك. كل الأرقام مدققة قانونياً.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all shadow-lg">
                  أريد أبيع وحدتي
                </button>
                <Link href="/opportunities" className="bg-transparent border border-slate-600 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all text-center">
                  تصفح فرص الشراء
                </Link>
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center justify-center lg:justify-start gap-2">
                <span className="text-emerald-500">🛡️</span> للبائع: مجاناً بالكامل. للمشتري: أرقام موثقة قبل ما تدفع أي دينار.
              </p>
            </div>

            <div className="order-1 lg:order-2">
                <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 relative">
                    <div className="mb-8 border-b border-slate-700 pb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-red-400 font-bold text-sm bg-red-900/30 px-3 py-1 rounded-full">✕ لو فسخت العقد ويه الشركة</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">خصم الإلغاء (15% من سعر الوحدة الإجمالي)</p>
                                <p className="text-3xl font-black text-red-500">- 22,500,000 د.ع</p>
                            </div>
                        </div>
                         <p className="text-xs text-red-400 mt-2">خسارة كبيرة من فلوسك + انتظار طويل للترجيع</p>
                    </div>

                    <div className="absolute left-1/2 top-[47%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center text-slate-500 font-black text-xs z-10">VS</div>

                    <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-800/50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-emerald-400 font-bold text-sm bg-emerald-900/50 px-3 py-1 rounded-full">✓ لو نقلت العقد عن طريق عقار مَخْرَج</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-emerald-500/70 mb-1">تسترجع كل اللي دفعته</p>
                                <p className="text-4xl font-black text-emerald-400">40,000,000 د.ع</p>
                                <p className="text-xs text-emerald-500 mt-1">كاش ومضمون عند التنازل</p>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-400 mt-4 font-bold bg-emerald-900/30 inline-block px-3 py-1.5 rounded-lg">فلوسك ترجع كاملة، والمشتري يكسب السعر القديم</p>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* زر الاستشارة البديل لسد ثغرة فقدان البائع */}
      <div className="bg-slate-900 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <a 
              href="https://wa.me/9647726394755?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%AD%D8%A7%D9%84%D8%A9%20%D8%AE%D8%A7%D8%B5%D8%A9%20%D9%88%D8%A3%D8%B9%D8%AA%D9%82%D8%AF%20%D8%A3%D9%86%20%D9%88%D8%AD%D8%AF%D8%AA%D9%8A%20%D8%AA%D8%B3%D8%AA%D8%AD%D9%82%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85%D8%A7%D9%8B%20%D9%85%D8%AE%D8%AA%D9%84%D9%81%D8%A7%D9%8B%20%D8%B9%D9%86%20%D8%AD%D8%A7%D8%B3%D8%A8%D8%A9%20%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9." 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 text-sm font-semibold transition-colors border-b border-slate-700 pb-1 inline-block"
            >
                حالتك مختلفة أو أرقامك غير مطابقة؟ تواصل مع خبير التقييم
            </a>
        </div>
      </div>

      {/* القسم الثاني: الإحصائيات */}
      <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
                  <div className="text-center py-6">
                      <p className="text-sm font-bold text-slate-500 mb-2">الوحدات على المنصة</p>
                      <p className="text-5xl font-black text-slate-900">54 <span className="text-xl text-slate-400 font-medium">وحدة</span></p>
                      <p className="text-xs text-slate-400 mt-2">منشورة في السوق، وتحت المراجعة</p>
                  </div>
                  <div className="text-center py-6">
                      <p className="text-sm font-bold text-slate-500 mb-2 flex items-center justify-center gap-2">قيمة الوحدات في السوق <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-[10px]">تقديري</span></p>
                      <p className="text-5xl font-black text-slate-900">12.5 <span className="text-xl text-slate-400 font-medium">مليار د.ع</span></p>
                      <p className="text-xs text-slate-400 mt-2">حسب أسعار السوق الحالية</p>
                  </div>
              </div>
          </div>
      </section>

      {/* القسم الثالث: المزايا المزدوجة */}
      <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">طرف محتاج يبيع، وطرف ينتظر فرصة ــ وإحنا نوصلهم</h2>
                  <p className="text-lg text-slate-600 font-medium">هنا لا توجد سرقفلية أو مبالغة. البائع يستلم المبالغ اللي دفعها بالدينار، والمشتري ياخذ عقد الشركة القديم مثل ما هو.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
                      <div className="absolute top-6 right-6 bg-slate-800 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-700">للمشتري المستثمر</div>
                      <h3 className="text-3xl font-black mb-4 pr-16">وحدة بالتقسيط بدون أي مبالغ إضافية</h3>
                      <p className="text-slate-400 mb-8 leading-relaxed font-medium">تاخذ الوحدة بسعر تعاقدها القديم — أرخص من سعر الشركة اليوم بفرق كبير — وتكمّل الأقساط العادية. الفرق هذا هو مكسبك الصافي.</p>
                      <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> سعر التعاقد القديم ثابت — السرقفلية ممنوعة بالمنصة</li>
                          <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> الوصولات والمدفوعات مدققة قانونياً قبل عرض الفرصة</li>
                          <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> التنازل يتم رسمياً بمقر الشركة المطورة — لا نتعامل بالوكالات العرفية</li>
                      </ul>
                      <Link href="/opportunities" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">تصفح الفرص المتاحة</Link>
                  </div>

                  <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100 relative">
                      <div className="absolute top-6 right-6 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold">للبائع صاحب الوحدة</div>
                      <h3 className="text-3xl font-black text-slate-900 mb-4 pr-32">البيع بالسعر الأصلي = أسرع تسييل بالسوق</h3>
                      <p className="text-slate-600 mb-8 leading-relaxed font-medium">لأن سعرك العادل هو نفس اللي دفعته، وحدتك تعتبر لقطة للمستثمرين فتباع أسرع. تسترجع فلوسك كاش كاملة بدل غرامات الشركات.</p>
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> تسترجع 100% من اللي دفعته — كاش عند إتمام التنازل</li>
                          <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> بيع صامت بدون إعلانات مزعجة ومكالمات دلالين</li>
                          <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> نجهز ملف التنازل ونرافقك لحد توقيع العقد واستلام الكاش</li>
                      </ul>
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center font-bold mb-6 text-sm">
                          الخدمة مجانية بالكامل للبائع — عقار مَخْرَج لا يأخذ أي عمولة منك.
                      </div>
                      <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors">اعرض وحدتك للتنازل</button>
                  </div>
              </div>
          </div>
      </section>

      {/* القسم الرابع: المقارنة */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">شنو الفرق بينا وبين المكاتب العقارية؟</h2>
            <p className="text-lg text-slate-500 font-medium">السوق مليء بالوسطاء — نحن نقدم منظومة تقنية شفافة تماماً.</p>
          </div>
          
          <div className="overflow-hidden rounded-3xl shadow-md border border-slate-200">
            <table className="w-full text-right bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-6 font-bold text-slate-400 text-sm border-l border-slate-200 w-1/5 bg-white"></th>
                  <th className="p-6 font-black text-xl border-l border-slate-200 w-2/5 bg-slate-900 text-white text-center">عقار مَخْرَج</th>
                  <th className="p-6 font-bold text-slate-500 text-center w-2/5">السوق العادي (الدلالين)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">السعر</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>بدون سرقفلية — السعر المطلوب هو ما تم دفعه بالوصولات فقط</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>مبالغة في السعر لغرض المساومة والفصال</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">الموثوقية</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>نتحقق من العقد والمدفوعات والمتبقي بالمستندات الرسمية</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>كلام شفهي بين البائع والوسيط بدون دليل قاطع</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">الإجراءات</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>نرافقك خطوة بخطوة لحد مقر الشركة للتوقيع واستلام المبلغ</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>الوسيط يربطك بالطرف الآخر ويتركك تتحمل مسؤولية الإجراءات</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">العمولة</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>مجاناً للبائع تماماً — نسبة بسيطة تؤخذ من المشتري فقط عند إتمام العقد</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>سعي وعمولات تؤخذ من الطرفين وقد تفشل الصفقة بسببها</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* القسم الخامس: إزاي بنشتغل */}
      <section id="how-it-works" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">شلون نشتغل؟</h2>
            <p className="text-lg text-slate-600 font-medium">خمس خطوات واضحة، ومندوب المنصة يرافقك في كل خطوة.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { num: '1', title: 'تقييم العقد', desc: 'أدخل بيانات عقدك لتعرف موقفك المالي فوراً، ليتم تجهيز ملفك في النظام.' },
              { num: '2', title: 'رفع المستندات', desc: 'إرفاق العقد ووصولات السداد ليقوم فريقنا القانوني بتدقيقها.' },
              { num: '3', title: 'تجهيز الفرصة', desc: 'بعد التحقق من الأرقام، نعرض وحدتك بأسلوب احترافي للمستثمرين.' },
              { num: '4', title: 'توفير المشتري', desc: 'نطابق وحدتك مع مشترين يمتلكون الكاش الفعلي والجاهزية للإكمال.' },
              { num: '5', title: 'نقل التعاقد', desc: 'نرافقك لإجراءات النقل القانوني في الشركة المطورّة لضمان استلام أموالك.' }
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-lg font-black mb-6">{step.num}</div>
                <h3 className="font-bold text-lg mb-3 text-slate-900">{step.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* القسم السادس: معايير الخروج العادل */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">معايير الخروج الآمن</h2>
            <p className="text-slate-500 font-medium">مواثيق نلتزم بها لضمان حق الطرفين.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">كل رقم له مصدر</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">نوضح للمشتري الأرقام المؤكدة بالمستندات فقط، نرفض المبالغات والأسعار الوهمية.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">مجاني للبائع بالكامل</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">البائع لا يدفع أي عمولة. المشتري يدفع نسبة وساطة بسيطة عند إتمام نقل الملكية رسمياً فقط.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">الخصوصية التامة</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">نظامنا يعتمد "البيع الصامت"، لا توجد إعلانات بأرقام الهواتف تسبب إزعاجاً ومكالمات وهمية.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">خيارات بلا ضغوط</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">نعرض عليك الموقف المالي بشفافية، لتتخذ القرار الأنسب لك دون أي إلحاح من جهتنا.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* القسم السابع: دعوة للعمل + نموذج VIP للمشتري */}
      <section className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 flex flex-col justify-center items-center h-72">
                      <h3 className="text-2xl font-black text-slate-900 mb-4">تبحث عن فرصة استثمارية؟</h3>
                      <p className="text-slate-500 mb-8 font-medium">أخبرنا بميزانيتك وسنوفر لك الفرص التي تناسب السيولة المتوفرة لديك والأقساط المريحة لك.</p>
                      <Link href="/opportunities" className="bg-white border-2 border-slate-200 hover:border-slate-900 text-slate-900 font-bold py-3 px-10 rounded-xl transition-all">تصفح الفرص الآن</Link>
                  </div>
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 flex flex-col justify-center items-center h-72">
                      <h3 className="text-2xl font-black text-slate-900 mb-4">تجد صعوبة في تسديد أقساطك؟</h3>
                      <p className="text-slate-500 mb-8 font-medium">لا تتسرع بفسخ العقد. اعرف موقفك المالي الآن مجاناً وبدون أي التزام.</p>
                      <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-10 rounded-xl transition-colors">ابدأ تقييم العقد</button>
                  </div>
              </div>

              {/* سد ثغرة فقدان المشتري: نموذج تسجيل الطلب الخاص (VIP) مدمج هنا */}
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
      </section>

      {/* الفوتر المُحدّث والمنسّق بدون خطأ new Date() */}
      <footer id="contact" className="bg-slate-900 text-slate-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* الشعار والوصف */}
            <div className="lg:col-span-2 space-y-6 text-right">
              {/* إضافة اللوجو في الفوتر بنفس أبعاد الهيدر */}
              <Link href="/" className="inline-block">
                <div className="relative w-40 h-16 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <Image 
                    src="/logo.jpg" 
                    alt="عقار مخرج" 
                    fill 
                    className="object-contain" 
                  />
                </div>
              </Link>
              <p className="text-sm font-medium leading-relaxed max-w-sm">
                منصة التنازل عن العقارات ووحدات التقسيط المتعثرة. البائع يسترجع أمواله نقداً، والمشتري يضمن سعر التعاقد القديم، مع تسهيل كافة الإجراءات القانونية.
              </p>
              <div className="space-y-2 pt-4">
                  <p className="text-white font-bold text-lg dir-ltr text-right block w-full">+964 772 639 4755</p>
                  <p className="text-slate-400 text-sm">info@aqarmakhraj.com</p>
              </div>
            </div>

            {/* روابط المنصة */}
            <div className="text-right">
              <h4 className="text-white font-bold mb-6 text-sm">المنصة</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">الرئيسية</Link></li>
                <li><button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer outline-none">تقييم العقد</button></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">آلية عمل البائع</a></li>
                <li><Link href="/opportunities" className="hover:text-white transition-colors cursor-pointer">آلية عمل المشتري</Link></li>
              </ul>
            </div>

            {/* روابط الشركة */}
            <div className="text-right">
              <h4 className="text-white font-bold mb-6 text-sm">الشركة</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li id="story"><a href="#story" className="hover:text-white transition-colors cursor-pointer">قصتنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">التقارير والمؤشرات</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">شلون نشتغل</a></li>
                <li><Link href="/b2b" className="hover:text-white transition-colors cursor-pointer">بوابة المطورين</Link></li>
              </ul>
            </div>

            {/* روابط قانونية */}
            <div className="text-right">
              <h4 className="text-white font-bold mb-6 text-sm">قانوني</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <button 
                    onClick={() => {
                      const msg = encodeURIComponent('مرحباً، أود الاستفسار عن سياسة الخصوصية الخاصة بالمنصة.')
                      window.open(`https://wa.me/9647726394755?text=${msg}`, '_blank')
                    }}
                    className="hover:text-white transition-colors cursor-pointer outline-none text-right w-full block"
                  >
                    سياسة الخصوصية
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const msg = encodeURIComponent('مرحباً، أود الاطلاع على الشروط والأحكام الخاصة بالتنازل.')
                      window.open(`https://wa.me/9647726394755?text=${msg}`, '_blank')
                    }}
                    className="hover:text-white transition-colors cursor-pointer outline-none text-right w-full block"
                  >
                    الشروط والأحكام
                  </button>
                </li>
              </ul>
            </div>

          </div>
          
          {/* حقوق النشر */}
          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-xs font-medium text-slate-500">
            جميع الحقوق محفوظة © 2026 عقار مَخْرَج
          </div>
        </div>
      </footer>

    </main>
  )
}