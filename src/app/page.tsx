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

  // --- زر الواتساب العائم ---
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
             <span className="text-xs text-emerald-400">بيرد في ثواني</span>
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

      {/* شريط التنقل */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-32 h-10"><Image src="/logo.jpg" alt="Logo" fill className="object-contain mix-blend-multiply" priority /></div>
            </Link>
            <div className="hidden md:flex items-center gap-8 px-6 text-sm">
              <button onClick={() => setIsModalOpen(true)} className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">بيع وحدتك</button>
              <Link href="/opportunities" className="text-slate-600 hover:text-emerald-600 font-extrabold transition-colors">الفرص المتاحة</Link>
              <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">إزاي بنشتغل</a>
              <a href="#story" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">قصتنا</a>
              <a href="#contact" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">كلمنا</a>
              <Link href="/b2b" className="text-slate-500 hover:text-blue-600 font-bold transition-colors border-r-2 border-slate-200 pr-6">للمستثمرين</Link>
            </div>
            <div className="flex gap-2">
                <Link href="/opportunities" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-all hidden sm:block">عايز تشتري</Link>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md transition-all">عايز تبيع</button>
            </div>
          </div>
        </div>
      </nav>

      {/* القسم الأول: الهيرو التسويقي (مستوحى من عقار إكزت) */}
      <section className="bg-slate-900 py-24 overflow-hidden relative text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* النص التسويقي */}
            <div className="space-y-8 order-2 lg:order-1 text-center lg:text-right">
              <span className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold tracking-wide border border-slate-700">
                منصة التنازل عن وحدات التقسيط — بدون أوفر
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.2] tracking-tight">
                البايع يسترجع كل اللي دفعه كاش، <br/>
                <span className="text-emerald-400">والمشتري ياخد سعر التعاقد القديم</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
                لو مش قادر تكمّل أقساطك: بيع وحدتك بدون أوفر واسترجع فلوسك، بدل ما تخاطر بخسارة ممكن توصل لـ 15% من سعر الوحدة في الإلغاء حسب عقدك. ولو بتدوّر على وحدة: اشتري بسعر تعاقد قديم أرخص من سعر السوق وكمّل الأقساط. كل الأرقام متحققة بالمستندات — وإحنا معاكم بنسهّل إجراءات التنازل خطوة بخطوة لحد الإتمام.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all shadow-lg">
                  بيع وحدتك
                </button>
                <Link href="/opportunities" className="bg-transparent border border-slate-600 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all text-center">
                  شوف فرص الشراء
                </Link>
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center justify-center lg:justify-start gap-2">
                <span className="text-emerald-500">🛡️</span> للبايع: مجانًا تمامًا — مفيش أي عمولة عليك. للمشتري: أرقام موثقة قبل ما تدفع جنيه.
              </p>
            </div>

            {/* بطاقة المثال الديناميكية (من إكزت) */}
            <div className="order-1 lg:order-2">
                <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 relative">
                    {/* حالة الإلغاء */}
                    <div className="mb-8 border-b border-slate-700 pb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-red-400 font-bold text-sm bg-red-900/30 px-3 py-1 rounded-full">✕ لو رجّع الوحدة للمطوّر</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">خصم الإلغاء (15% من سعر الوحدة كله)</p>
                                <p className="text-3xl font-black text-red-500">- 22,500,000 د.ع</p>
                            </div>
                        </div>
                         <p className="text-xs text-red-400 mt-2">خسارة كبيرة من فلوسه + سنين انتظار</p>
                    </div>

                    {/* علامة الـ VS */}
                    <div className="absolute left-1/2 top-[47%] transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center text-slate-500 font-black text-xs z-10">VS</div>

                    {/* حالة التنازل */}
                    <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-800/50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-emerald-400 font-bold text-sm bg-emerald-900/50 px-3 py-1 rounded-full">✓ لو نقل تعاقده عن طريق عقار مَخْرَج</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-emerald-500/70 mb-1">يسترجع اللي دفعه</p>
                                <p className="text-4xl font-black text-emerald-400">40,000,000 د.ع</p>
                                <p className="text-xs text-emerald-500 mt-1">كاش عند إتمام النقل</p>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-400 mt-4 font-bold bg-emerald-900/30 inline-block px-3 py-1.5 rounded-lg">فلوسه كاملة، والمشتري كسب سعر قديم</p>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* القسم الثاني: الإحصائيات (جديد) */}
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
                      <p className="text-xs text-slate-400 mt-2">بسعر السوق الحالي للوحدة</p>
                  </div>
              </div>
          </div>
      </section>

      {/* القسم الثالث: المزايا المزدوجة (البائع والمشتري) */}
      <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">طرف محتاج يبيع، وطرف مستني الفرصة ــ وإحنا بنوصلهم</h2>
                  <p className="text-lg text-slate-600 font-medium">ده مش ريسيل عادي: مفيش أوفر خالص. البايع بياخد اللي دفعه بالظبط والمشتري بياخد سعر التعاقد القديم زي ما هو.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* كارت المشتري */}
                  <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
                      <div className="absolute top-6 right-6 bg-slate-800 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-700">المشتري</div>
                      <h3 className="text-3xl font-black mb-4 pr-16">وحدة بالتقسيط من غير ما تدفع أوفر لحد</h3>
                      <p className="text-slate-400 mb-8 leading-relaxed font-medium">بتاخد الوحدة بسعر تعاقدها القديم — أرخص من سعر المطور النهارده بفرق كبير — وتكمّل الأقساط العادية. الفرق ده مكسبك من يوم ما تمضي، ومن غير جنيه أوفر.</p>
                      <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> سعر التعاقد القديم زي ما هو — الأوفر ممنوع على المنصة</li>
                          <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> العقد والمدفوعات والمتبقي متحقق منهم قبل ما تشوف الفرصة</li>
                          <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> تنازل رسمي معتمد من المطور — مش توكيلات وكلام</li>
                      </ul>
                      <Link href="/opportunities" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">شوف الفرص المتاحة</Link>
                  </div>

                  {/* كارت البائع */}
                  <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-100 relative">
                      <div className="absolute top-6 right-6 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold">البايع ــ صاحب الوحدة</div>
                      <h3 className="text-3xl font-black text-slate-900 mb-4 pr-32">بدون أوفر = أسرع بيع في السوق</h3>
                      <p className="text-slate-600 mb-8 leading-relaxed font-medium">لأن سعرك هو نفس اللي دفعته من غير أي زيادة، وحدتك بتبقى أحسن فرصة قدام المشترين — فبتتباع أسرع. تسترجع فلوسك كاملة كاش، بدل ما المطور يخصم منك ويقسّط لك الباقي على سنين.</p>
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> تسترجع 100% من اللي دفعته — كاش عند إتمام التنازل</li>
                          <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> من غير إعلانات علنية ولا تليفونات سماسرة</li>
                          <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> بنجهّز معاك ملف التنازل وبنتابع معاك خطوة بخطوة لحد الإمضاء</li>
                      </ul>
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center font-bold mb-6 text-sm">
                          مجانًا عليك تمامًا — عقار مَخْرَج مش بتاخد أي عمولة من البايع.
                      </div>
                      <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors">اعرض وحدتك للتنازل</button>
                  </div>
              </div>
          </div>
      </section>

      {/* القسم الرابع: إيه الفرق بينا وبين الريسيل العادي؟ */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">إيه الفرق بينا وبين الريسيل العادي؟</h2>
            <p className="text-lg text-slate-500 font-medium">السوق مليان إعلانات وسماسرة — إحنا بنشتغل بطريقة تانية خالص.</p>
          </div>
          
          <div className="overflow-hidden rounded-3xl shadow-md border border-slate-200">
            <table className="w-full text-right bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-6 font-bold text-slate-400 text-sm border-l border-slate-200 w-1/5 bg-white"></th>
                  <th className="p-6 font-black text-xl border-l border-slate-200 w-2/5 bg-slate-900 text-white text-center">عقار مَخْرَج</th>
                  <th className="p-6 font-bold text-slate-500 text-center w-2/5">الريسيل العادي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">السعر</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>بدون أوفر — السعر = اللي اتدفع فعلًا، موثق بالإيصالات</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>أوفر فوق السعر، ومبالغة عشان الفصال</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">الأرقام</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>متحققين من العقد والمدفوعات والمتبقي — بالمستندات الرسمية</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>كلام البائع والسمسار من غير دليل</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">الإجراءات</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>بنمشي معاك في كل خطوات التنازل لحد الإمضاء والقبض</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>السمسار بيوصلك وبعدين انت وحظك</td>
                </tr>
                <tr>
                  <td className="p-6 font-bold text-slate-900 bg-slate-50 border-l border-slate-200 text-center">العمولة</td>
                  <td className="p-6 text-slate-800 font-semibold border-l border-slate-200 bg-emerald-50/30 text-center"><span className="text-emerald-500 ml-2">✓</span>مجانًا للبايع — 1.5% على المشتري بس، وعند إتمام التنازل فقط</td>
                  <td className="p-6 text-slate-500 text-center"><span className="text-red-400 ml-2">✕</span>سعي وسمسرة من الطرفين في كل خطوة ومفاجآت</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* القسم الخامس: إزاي بنشتغل (الخطوات) */}
      <section id="how-it-works" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">إزاي بنشتغل؟</h2>
            <p className="text-lg text-slate-600 font-medium">خمس خطوات واضحة، ومسؤول حالة معاك في كل خطوة.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { num: '1', title: 'قيّم عقدك', desc: 'دخل بيانات عقدك واعرف موقفك مجانًا — وأول ما تبعت طلبك، حسابك بيتجهّز تلقائيًا' },
              { num: '2', title: 'ارفع مستنداتك', desc: 'العقد وإيصالات السداد — بنراجعها ونتحقق منها' },
              { num: '3', title: 'بنجّهز فرصتك', desc: 'بنتحقق من الأرقام بالمستندات ونجهّز عرض موثوق للمشترين' },
              { num: '4', title: 'بنلاقي المشتري', desc: 'بنطابق وحدتك مع مشترين قادرين فعلًا يكمّلوا' },
              { num: '5', title: 'نقل التعاقد', desc: 'بنمشي معاك في إجراءات النقل خطوة بخطوة لحد ما تقبض' }
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
            <h2 className="text-3xl font-black text-slate-900 mb-4">معايير الخروج العادل</h2>
            <p className="text-slate-500 font-medium">وضعنا قواعد ملزمة لنفسنا قبل ما نطلبك تثق فينا.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">كل رقم له مصدر</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">بنوضّحلك إيه المؤكّد بالمستندات وإيه التقديري — من غير وعود مضللة</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">مجانًا للبايع بالكامل</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">مفيش أي عمولة على البايع خالص. المشتري بيدفع 1.5% عند إتمام النقل بس — من غير أي رسوم مخفية</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">خصوصيتك محفوظة</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">تقدر تختار الخروج الصامت — مفيش إعلان علني ولا تليفونات مزعجة</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-blue-500 mt-1">🛡️</div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">من غير ضغط</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">بنعرض عليك كل الخيارات — حتى لو الأفضل ليك إنك تكمّل تعاقدك</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* القسم السابع: دعوة للعمل (Call to Action المزدوجة) */}
      <section className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* للمشتري */}
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 flex flex-col justify-center items-center h-72">
                      <h3 className="text-2xl font-black text-slate-900 mb-4">بتدوّر على فرصة حقيقية؟</h3>
                      <p className="text-slate-500 mb-8 font-medium">سجّل ميزانيتك وهنبعتلك الفرص اللي تناسب الكاش المتاح معاك والقسط اللي يريحك.</p>
                      <Link href="/opportunities" className="bg-white border-2 border-slate-200 hover:border-slate-900 text-slate-900 font-bold py-3 px-10 rounded-xl transition-all">سجّل كمشتري</Link>
                  </div>
                  {/* للبائع */}
                  <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 flex flex-col justify-center items-center h-72">
                      <h3 className="text-2xl font-black text-slate-900 mb-4">مش قادر تكمّل أقساطك؟</h3>
                      <p className="text-slate-500 mb-8 font-medium">متتسرعش في قرار الإلغاء. اعرف موقفك الأول — التقييم مجاني ومن غير أي التزام.</p>
                      <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-10 rounded-xl transition-colors">ابدأ تقييم عقدك</button>
                  </div>
              </div>
          </div>
      </section>

      {/* الفوتر الشامل */}
      <footer id="contact" className="bg-slate-900 text-slate-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* الشعار والوصف */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-transparent border border-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-xl">م</div>
                <span className="font-bold text-2xl text-white tracking-tight">عقار مَخْرَج</span>
              </div>
              <p className="text-sm font-medium leading-relaxed max-w-sm">
                منصة التنازل عن وحدات التقسيط بدون أوفر — البايع يسترجع فلوسه كاش، والمشتري ياخد سعر التعاقد القديم، وإحنا بنسهّل الإجراءات خطوة بخطوة.
              </p>
              <div className="space-y-2 pt-4">
                  <p className="text-white font-bold text-lg dir-ltr text-left">+964 772 639 4755</p>
                  <p className="text-slate-400 text-sm">info@aqarmakhraj.com</p>
              </div>
            </div>

            {/* روابط المنصة */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm">المنصة</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/" className="hover:text-white transition-colors">المفضلة</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">حاسبة الخروج</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">للبايعين</a></li>
                <li><Link href="/opportunities" className="hover:text-white transition-colors">للمشترين</Link></li>
              </ul>
            </div>

            {/* روابط الشركة */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm">الشركة</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li id="story"><a href="#" className="hover:text-white transition-colors">قصتنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors">التقارير والمؤشرات</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">إزاي بنشتغل</a></li>
                <li><Link href="/b2b" className="hover:text-white transition-colors">للمطورين</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">علاقات المستثمرين</a></li>
              </ul>
            </div>

            {/* قانوني */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm">قانوني</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a></li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

    </main>
  )
}