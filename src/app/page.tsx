'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [originalPrice, setOriginalPrice] = useState<string>('150')
  const [paidAmount, setPaidAmount] = useState<string>('40')
  const [financingType, setFinancingType] = useState<'developer' | 'bank'>('developer')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [compound, setCompound] = useState('')
  const [isExpat, setIsExpat] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const numOriginal = parseFloat(originalPrice) || 0
  const numPaid = parseFloat(paidAmount) || 0
  const cancellationPenalty = +(numOriginal * 0.15).toFixed(1)
  const remainingInstallments = Math.max(0, +(numOriginal - numPaid).toFixed(1))

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

    const financingLabel = financingType === 'developer' ? 'أقساط شركة مطورة' : 'قرض عقاري / مصرفي'
    const compoundWithFinancing = `${compound} (${financingLabel})`

    const { error } = await supabase.from('leads').insert([{
      phone_number: phone,
      compound_name: compoundWithFinancing,
      original_price: numOriginal ? numOriginal * 1000000 : null,
      paid_amount: numPaid ? numPaid * 1000000 : null,
      requires_expat_service: isExpat,
      contract_image_url: uploadedFileUrl
    }])

    setIsSubmitting(false)
    if (!error) {
      setSubmitSuccess(true)
      const whatsappMsg = encodeURIComponent(
        `مرحباً عقار مخرج، سجلت وحدتي في مجمع ${compound} (${financingLabel}) - سعر العقد: ${numOriginal} مليون، المدفوع: ${numPaid} مليون، وأريد استكمال الإجراءات.`
      )
      setTimeout(() => {
        window.open(`https://wa.me/9647726394755?text=${whatsappMsg}`, '_blank')
        setIsModalOpen(false)
        setSubmitSuccess(false)
        setFile(null)
      }, 2000)
    } else {
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    }
  }

  const FloatingWhatsApp = () => (
    <a
      href="https://wa.me/9647726394755"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 bg-slate-900/95 backdrop-blur-md text-white rounded-full flex items-center justify-center p-4 shadow-2xl hover:bg-emerald-950 transition-all z-50 border border-emerald-500/30"
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200" dir="rtl">
      <FloatingWhatsApp />

      {/* النافذة المنبثقة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-slate-100">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 transition-colors text-xl font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            <h3 className="text-2xl font-extrabold mb-2 text-slate-900 text-center mt-2">سجل بياناتك للبدء</h3>
            <p className="text-center text-slate-500 text-sm mb-6">خطوتك الأولى نحو الخروج الآمن بدون خسائر</p>
            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center font-bold text-lg">
                🎉 تم استلام طلبك بنجاح!<br /><span className="text-sm font-normal mt-2 block">جاري تحويلك للواتساب للتواصل المباشر...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نوع الأقساط الحالية</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFinancingType('developer')}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                        financingType === 'developer'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      أقساط مع الشركة المطورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinancingType('bank')}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                        financingType === 'bank'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      قرض عقاري / مصرفي
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم المجمع السكني (أو المشروع)</label>
                  <input required type="text" value={compound} onChange={(e) => setCompound(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium" placeholder="مثال: بسماية، النرجس، جوهرة البصرة" />
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
                <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-lg py-4 rounded-xl mt-4 transition-all shadow-lg hover:shadow-emerald-500/30">
                  {isSubmitting ? 'جاري تأمين بياناتك...' : 'إرسال والتحويل للواتساب'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* شريط التنقل مع اللوجو الشفاف المضبوط */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center py-1">
              <div className="relative w-40 h-16 sm:w-48 sm:h-18 overflow-hidden flex items-center">
                <Image
                  src="/logo.png"
                  alt="عقار مخرج"
                  fill
                  sizes="(max-width: 640px) 160px, 192px"
                  className="object-contain object-right scale-125"
                  priority
                />
              </div>
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

      {/* القسم الأول: الهيرو التسويقي بخلفية معمارية واضحة ومتوازنة + الحاسبة التفاعلية */}
      <section className="relative py-20 lg:py-28 min-h-[680px] flex items-center overflow-hidden text-white bg-slate-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-iraq.jpg"
            alt="مجمعات سكنية حديثة في العراق"
            fill
            sizes="100vw"
            className="object-cover object-center brightness-95 contrast-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950/90 via-slate-950/55 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-8 order-2 lg:order-1 text-center lg:text-right">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-xs font-bold tracking-wide border border-emerald-400/40 shadow-sm">
                منصة التنازل عن وحدات التقسيط في العراق — بدون أوفر (سرقفلية)
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.2] tracking-tight drop-shadow-md">
                البائع يسترجع كل اللي دفعه كاش، <br />
                <span className="text-emerald-400">والمشتري ياخذ السعر القديم</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium drop-shadow-sm">
                إذا ما تقدر تكمّل أقساطك (سواء ويه الشركة أو قرض عقاري): بيع وحدتك بدون سرقفلية واسترجع فلوسك، بدل ما تخاطر بخسارة كبيرة من قيمة العقد بسبب غرامات الإلغاء. وإذا تدور على فرصة: اشتري بسعر تعاقد قديم وتجنب غلاء السوق.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/60">
                  أريد أبيع وحدتي
                </button>
                <Link href="/opportunities" className="bg-slate-950/60 backdrop-blur-md border border-white/30 hover:bg-slate-900/80 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all text-center">
                  تصفح فرص الشراء
                </Link>
              </div>
              <p className="text-sm text-slate-200 font-medium flex items-center justify-center lg:justify-start gap-2 drop-shadow-sm">
                <span className="text-emerald-400">🛡️</span> للبائع: مجاناً بالكامل. للمشتري: أرقام موثقة قبل ما تدفع أي دينار.
              </p>
            </div>

            {/* الحاسبة التفاعلية الزجاجية */}
            <div className="order-1 lg:order-2">
              <div className="bg-slate-950/75 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 relative shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-lg font-extrabold text-white mb-1">احسب خسارتك قبل ما تفسخ العقد 🧮</h2>
                  <p className="text-xs text-slate-300">أدخل أرقام وحدتك بالمليون دينار وشوف الفرق فوراً:</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">سعر الوحدة بالعقد (مليون)</label>
                    <input
                      type="number"
                      min="0"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-500/60 rounded-xl px-3.5 py-2.5 text-white font-extrabold text-lg outline-none focus:border-emerald-400 transition-colors"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">المبلغ المدفوع (مليون)</label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-500/60 rounded-xl px-3.5 py-2.5 text-white font-extrabold text-lg outline-none focus:border-emerald-400 transition-colors"
                      placeholder="40"
                    />
                  </div>
                </div>

                <div className="mb-5 border-b border-white/15 pb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-red-300 font-bold text-xs bg-red-950/80 border border-red-500/40 px-3 py-1 rounded-full">✕ لو فسخت العقد ويه الشركة</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">خصم الإلغاء المتوقع (15% من سعر الوحدة الإجمالي)</p>
                  <p className="text-3xl font-black text-red-400">- {cancellationPenalty.toLocaleString()} مليون د.ع</p>
                  <p className="text-xs text-red-300/90 mt-1">خسارة مباشرة من فلوسك + انتظار طويل للترجيع</p>
                </div>

                <div className="bg-emerald-950/75 p-5 rounded-2xl border border-emerald-400/35">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-emerald-300 font-bold text-xs bg-emerald-900/80 px-3 py-1 rounded-full">✓ لو نقلت العقد عبر عقار مَخْرَج</span>
                  </div>
                  <p className="text-xs text-emerald-100/90 mb-1">تسترجع كل اللي دفعته كاش (والمتبقي على المشتري: {remainingInstallments.toLocaleString()} مليون)</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400">{numPaid.toLocaleString()} مليون د.ع</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg"
                  >
                    احمِ فلوسك وقيّم عقدك مجاناً ←
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-10 text-center">
            <a
              href="https://wa.me/9647726394755?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%AD%D8%A7%D9%84%D8%A9%20%D8%AE%D8%A7%D8%B5%D8%A9%20%D9%88%D8%A3%D8%B9%D8%AA%D9%82%D8%AF%20%D8%A3%D9%86%20%D9%88%D8%AD%D8%AF%D8%AA%D9%8A%20%D8%AA%D8%B3%D8%AA%D8%AD%D9%82%20%D8%AA%D9%82%D9%8A%D9%8A%D9%85%D8%A7%D9%8B%20%D9%85%D8%AE%D8%AA%D9%84%D9%81%D8%A7%D9%8B%20%D8%B9%D9%86%20%D8%AD%D8%A7%D8%B3%D8%A8%D8%A9%20%D8%A7%D9%84%D9%85%D9%88%D9%82%D8%B9."
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-emerald-400 text-sm font-semibold transition-colors border-b border-slate-400/60 pb-1 inline-block drop-shadow-sm"
            >
              حالتك مختلفة أو أرقامك غير مطابقة؟ تواصل مع خبير التقييم
            </a>
          </div>
        </div>
      </section>

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

      {/* القسم الثالث: المزايا المزدوجة مع صور معمارية مدمجة */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">طرف محتاج يبيع، وطرف ينتظر فرصة ــ وإحنا نوصلهم</h2>
            <p className="text-lg text-slate-600 font-medium">هنا لا توجد سرقفلية أو مبالغة. البائع يستلم المبالغ اللي دفعها بالدينار، والمشتري ياخذ عقد الشركة القديم مثل ما هو.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* بطاقة المشتري المستثمر */}
            <div className="bg-slate-900 text-white rounded-3xl shadow-xl overflow-hidden flex flex-col group border border-slate-800">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/images/buyer-iraq.jpg"
                  alt="شقة فاخرة في مجمع سكني عراقي"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                <div className="absolute top-5 right-5 bg-slate-900/85 backdrop-blur-md text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30">
                  للمشتري المستثمر
                </div>
              </div>
              <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-4">وحدة بالتقسيط بدون أي مبالغ إضافية</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed font-medium">تاخذ الوحدة بسعر تعاقدها القديم — أرخص من سعر الشركة اليوم بفرق كبير — وتكمّل الأقساط العادية. الفرق هذا هو مكسبك الصافي.</p>
                  <ul className="space-y-4 mb-10 text-sm sm:text-base">
                    <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> سعر التعاقد القديم ثابت — السرقفلية ممنوعة بالمنصة</li>
                    <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> الوصولات والمدفوعات مدققة قانونياً قبل عرض الفرصة</li>
                    <li className="flex items-center gap-3"><span className="text-emerald-400">✓</span> التنازل يتم رسمياً بمقر الشركة المطورة — لا نتعامل بالوكالات العرفية</li>
                  </ul>
                </div>
                <Link href="/opportunities" className="inline-block text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg">
                  تصفح الفرص المتاحة
                </Link>
              </div>
            </div>

            {/* بطاقة البائع صاحب الوحدة */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden flex flex-col group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/images/seller-iraq.jpg"
                  alt="توقيع التنازل الرسمي واستلام الكاش"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-slate-900/20" />
                <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  للبائع صاحب الوحدة
                </div>
              </div>
              <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">البيع بالسعر الأصلي = أسرع تسييل بالسوق</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed font-medium">لأن سعرك العادل هو نفس اللي دفعته، وحدتك تعتبر لقطة للمستثمرين فتباع أسرع. تسترجع فلوسك كاش كاملة بدل غرامات الشركات.</p>
                  <ul className="space-y-4 mb-8 text-sm sm:text-base">
                    <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> تسترجع 100% من اللي دفعته — كاش عند إتمام التنازل</li>
                    <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> بيع صامت بدون إعلانات مزعجة ومكالمات دلالين</li>
                    <li className="flex items-center gap-3 text-slate-800 font-semibold"><span className="text-emerald-600">✓</span> نجهز ملف التنازل ونرافقك لحد توقيع العقد واستلام الكاش</li>
                  </ul>
                </div>
                <div>
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center font-bold mb-5 text-sm border border-emerald-100">
                    الخدمة مجانية بالكامل للبائع — عقار مَخْرَج لا يأخذ أي عمولة منك.
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md">
                    اعرض وحدتك للتنازل
                  </button>
                </div>
              </div>
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

      {/* القسم الخامس: شلون نشتغل */}
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

      {/* القسم السادس: معايير الخروج الآمن */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">معايير الخروج الآمن</h2>
            <p className="text-slate-500 font-medium">مواثيق نلتزم بها لضمان حق الطرفين.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex gap-4">
              <div className="text-emerald-600 mt-1 text-xl">🛡️</div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">كل رقم له مصدر</h3>
                <p className="text-slate-500 text-sm leading-relaxed">نوضح للمشتري الأرقام المؤكدة بالمستندات فقط، نرفض المبالغات والأسعار الوهمية.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-emerald-600 mt-1 text-xl">🛡️</div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">مجاني للبائع بالكامل</h3>
                <p className="text-slate-500 text-sm leading-relaxed">البائع لا يدفع أي عمولة. المشتري يدفع نسبة وساطة بسيطة عند إتمام نقل الملكية رسمياً فقط.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-emerald-600 mt-1 text-xl">🛡️</div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">الخصوصية التامة</h3>
                <p className="text-slate-500 text-sm leading-relaxed">نظامنا يعتمد &quot;البيع الصامت&quot;، لا توجد إعلانات بأرقام الهواتف تسبب إزعاجاً ومكالمات وهمية.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-emerald-600 mt-1 text-xl">🛡️</div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">خيارات بلا ضغوط</h3>
                <p className="text-slate-500 text-sm leading-relaxed">نعرض عليك الموقف المالي بشفافية، لتتخذ القرار الأنسب لك دون أي إلحاح من جهتنا.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* القسم السابع: دعوة للعمل + بانر VIP */}
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

          {/* بانر خدمة VIP */}
          <div className="mt-20 rounded-3xl px-8 py-16 md:px-16 md:py-24 text-center shadow-2xl border border-emerald-500/30 relative overflow-hidden bg-slate-950">
            <Image
              src="/images/vip-iraq.jpg"
              alt="فرص استثمارية حصرية في العراق"
              fill
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="object-cover object-center brightness-95 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/35" />

            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/25 backdrop-blur-md text-amber-200 text-xs font-bold border border-amber-400/40 mb-5 shadow-sm">
                خدمة المستثمرين الحصرية VIP
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-white mb-4 drop-shadow-md">لم تجد الفرصة المناسبة لميزانيتك؟</h3>
              <p className="text-slate-100 mb-8 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                سوق العقارات يتحرك بسرعة، وأفضل الفرص تُباع وتُحجز قبل نشرها على المنصة. سجل طلبك الخاص وسيقوم فريقنا بالبحث وتوفير العرض المناسب لك سراً خلال 48 ساعة.
              </p>
              <button
                onClick={() => {
                  const msg = encodeURIComponent('مرحباً، أبحث عن فرصة استثمارية بمواصفات معينة (المجمع/الميزانية) ولم أجدها في الموقع. أرجو المساعدة بتوفيرها.')
                  window.open(`https://wa.me/9647726394755?text=${msg}`, '_blank')
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-xl border border-emerald-400/50"
              >
                سجل طلبك (خدمة الاستثمار VIP)
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* الفوتر */}
      <footer id="contact" className="bg-slate-900 text-slate-400 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2 space-y-6 text-right">
              <Link href="/" className="inline-block">
                <div className="relative w-44 h-16 bg-white/95 px-4 py-2 rounded-2xl shadow-md overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="عقار مخرج"
                    fill
                    sizes="176px"
                    className="object-contain scale-110 p-1"
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

            <div className="text-right">
              <h4 className="text-white font-bold mb-6 text-sm">المنصة</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/" className="hover:text-white transition-colors cursor-pointer">الرئيسية</Link></li>
                <li><button onClick={() => setIsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer outline-none">تقييم العقد</button></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">آلية عمل البائع</a></li>
                <li><Link href="/opportunities" className="hover:text-white transition-colors cursor-pointer">آلية عمل المشتري</Link></li>
              </ul>
            </div>

            <div className="text-right">
              <h4 className="text-white font-bold mb-6 text-sm">الشركة</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li id="story"><a href="#story" className="hover:text-white transition-colors cursor-pointer">قصتنا</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">التقارير والمؤشرات</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">شلون نشتغل</a></li>
                <li><Link href="/b2b" className="hover:text-white transition-colors cursor-pointer">بوابة المطورين</Link></li>
              </ul>
            </div>

            <div className="text-right">
              <h4 className="text-white font-bold mb-6 text-sm">قانوني</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/privacy" className="hover:text-white transition-colors cursor-pointer outline-none block">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors cursor-pointer outline-none block">الشروط والأحكام</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-xs font-medium text-slate-500">
            جميع الحقوق محفوظة © 2026 عقار مَخْرَج
          </div>
        </div>
      </footer>
    </main>
  )
}