'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  // ... (نفس متغيرات الحالة السابقة) ...
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
      const whatsappMsg = encodeURIComponent(`مرحباً عقار مخرج، سجلت وحدتي في مجمع ${compound}`)
      setTimeout(() => {
        window.open(`https://wa.me/9647700000000?text=${whatsappMsg}`, '_blank')
        setIsModalOpen(false); setSubmitSuccess(false); setFile(null)
      }, 2000)
    } else {
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    }
  }

  // --- محتوى الموقع بالكامل ---
  const content = {
    ar: {
      dir: 'rtl',
      nav: { sell: 'عرض وحدتك', buy: 'الفرص المتاحة', login: 'تسجيل الدخول' },
      hero: { title: 'البائع يسترجع فلوسه كاش، والمشتري يربح سعر الطرح القديم.', subtitle: 'لا تخسر غرامات الإلغاء للمطور. نعرض وحدتك المتعثرة بسرية تامة، ونوصلك بمشتري جاهز يكمل الأقساط بنفس عقدك القديم.' },
      features: {
        title: 'حلول حصرية للسوق العراقي',
        list: [
          { title: 'حاسبة فرق الدينار/الدولار', desc: 'نوفر لك الحسبة الدقيقة لفرق العملة بين يوم التعاقد واليوم لضمان أعلى شفافية.' },
          { title: 'بوابة المغتربين', desc: 'أنت خارج العراق؟ نوفر خدمة التحويل بالوكالة المصدقة عبر مستشارنا القانوني.' },
          { title: 'تجزئة الفرصة', desc: 'للعقود الكبيرة، نتيح لمستثمرين اثنين الدخول معاً لاقتناص الفرصة مناصفة.' },
          { title: 'حسابات المطورين', desc: 'نظام B2B لإدارات المبيعات لرفع عقود عملائهم المتعثرين لتوفير سيولة فورية للشركة.' }
        ]
      },
      comparison: {
        title: 'إيه الفرق بينا وبين السوق العادي (الدلالين)؟',
        headers: ['الميزة', 'عقار مَخْرَج', 'السوق العادي'],
        rows: [
          ['العمولة', 'مجاناً للبائع تماماً (0%)', 'يأخذون 2% من الطرفين'],
          ['السعر', 'بدون فرق (أوفر) وهمي', 'مبالغة في السعر والسرقفلية'],
          ['الأمان', 'تدقيق كامل للوصولات الرسمية', 'كلام مرسل بدون إثبات'],
          ['الإجراءات', 'نرافقك حتى التوقيع بالشركة', 'المكتب العقاري غير مسؤول بعد القبض']
        ]
      },
      steps: {
        title: 'كيف نعمل؟ 4 خطوات لخروج آمن',
        list: ['قيّم عقدك مجاناً عبر المنصة', 'ارفع مستنداتك ووصولات الدفع', 'نطابق وحدتك مع مشترين جادين', 'نتمم التنازل قانونياً في مقر المطور']
      },
      footer: {
        desc: 'منصة التنازل عن العقارات ووحدات التقسيط المتعثرة. البائع يسترجع فلوسه، والمشتري يربح السعر القديم.',
        links: ['عن الشركة', 'الفرص المتاحة', 'حاسبة الخروج', 'للمطورين'],
        legal: ['سياسة الخصوصية', 'الشروط والأحكام', 'الضمانات القانونية'],
        contact: { phone: '+964 770 000 0000', email: 'info@aqarmakhraj.iq', address: 'بغداد، المنصور، شارع الرواد' }
      }
    }
  }

  const t = content.ar 

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* --- النافذة المنبثقة للرفع --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          {/* ... (نفس كود الـ Modal السابق للرفع والواتساب) ... */}
           <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold">✕</button>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 text-center">أكمل بياناتك لنتواصل معك</h3>
            {submitSuccess ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-bold">تم الاستلام! جاري تحويلك للواتساب...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-semibold mb-2">اسم المجمع</label><input required type="text" value={compound} onChange={(e) => setCompound(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-semibold mb-2">رقم الواتساب</label><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-3 text-left" dir="ltr" placeholder="+964..." /></div>
                <div>
                  <label className="block text-sm font-semibold mb-2">إرفاق صورة العقد (اختياري)</label>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"/>
                </div>
                <div className="flex items-center gap-2 mt-4 bg-slate-50 p-3 rounded-lg border">
                  <input type="checkbox" id="expat" checked={isExpat} onChange={(e) => setIsExpat(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <label htmlFor="expat" className="text-sm font-medium">أنا خارج العراق (خدمة المغتربين)</label>
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-6">{isSubmitting ? 'جاري الرفع...' : 'إرسال والتحويل لواتساب'}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- شريط التنقل --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-40 h-14"><Image src="/logo.jpg" alt="Logo" fill className="object-contain mix-blend-multiply" priority /></div>
            </Link>
            <div className="hidden md:flex items-center gap-8 px-6">
              <button onClick={() => setIsModalOpen(true)} className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">{t.nav.sell}</button>
              <Link href="/opportunities" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">{t.nav.buy}</Link>
            </div>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium text-sm">{t.nav.login}</button>
          </div>
        </div>
      </nav>

      {/* --- الهيرو والحاسبة --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="inline-block px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">منصة التنازل الآمن الأولى في العراق</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.2]">{t.hero.title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">{t.hero.subtitle}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <h2 className="text-2xl font-bold text-center mb-8">احسب موقفك المالي في دقيقة</h2>
            <div className="space-y-4 mb-6">
              <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} className="w-full bg-slate-50 border rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-lg" placeholder="سعر العقد الأصلي" />
              <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="w-full bg-slate-50 border rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-lg" placeholder="ما تم دفعه كاش للمطور" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-sm font-bold text-emerald-800 mb-1">تسترجع كاش</p>
                <p className="text-2xl font-black text-emerald-600">{paidAmount ? paidAmount.toLocaleString() : '0'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm font-bold text-blue-800 mb-1">متبقي أقساط</p>
                <p className="text-2xl font-black text-blue-600">{remainingInstallments > 0 ? remainingInstallments.toLocaleString() : '0'}</p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-600 transition-colors">سجل وحدتك الآن (مجانًا للبائع)</button>
          </div>
        </div>
      </div>

      {/* --- قسم الميزات الحصرية --- */}
      <div className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12">{t.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.list.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg mb-4 flex items-center justify-center text-emerald-600 text-xl font-black">{idx + 1}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- جدول المقارنة --- */}
      <div className="py-20 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center mb-12">{t.comparison.title}</h2>
        <div className="overflow-hidden rounded-2xl shadow-lg border border-slate-200">
          <table className="w-full text-right bg-white">
            <thead className="bg-slate-900 text-white">
              <tr>{t.comparison.headers.map((h, i) => <th key={i} className="p-4 font-bold text-lg">{h}</th>)}</tr>
            </thead>
            <tbody>
              {t.comparison.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800 bg-slate-50 w-1/4">{row[0]}</td>
                  <td className="p-4 text-emerald-700 font-bold w-2/5"><span className="text-emerald-500 ml-2">✓</span>{row[1]}</td>
                  <td className="p-4 text-slate-500 w-2/5"><span className="text-red-400 ml-2">✕</span>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- قسم خطوات العمل --- */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">{t.steps.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            {t.steps.list.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-sm">{index + 1}</div>
                <h3 className="font-bold text-lg leading-snug">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- الفوتر الشامل (Footer) --- */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* الشعار والوصف */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center font-bold text-white text-xl">م</div>
                <span className="font-bold text-2xl text-white">عقار مَخْرَج</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">{t.footer.desc}</p>
            </div>

            {/* روابط سريعة */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">روابط سريعة</h4>
              <ul className="space-y-3">
                {t.footer.links.map((link, i) => (
                  <li key={i}><a href="#" className="hover:text-emerald-400 transition-colors text-sm">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* الشئون القانونية */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">قانوني</h4>
              <ul className="space-y-3">
                {t.footer.legal.map((item, i) => (
                  <li key={i}><a href="#" className="hover:text-emerald-400 transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* بيانات الاتصال */}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">تواصل معنا</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3"><span className="text-emerald-500">📞</span> <span dir="ltr">{t.footer.contact.phone}</span></li>
                <li className="flex items-center gap-3"><span className="text-emerald-500">✉️</span> {t.footer.contact.email}</li>
                <li className="flex items-center gap-3"><span className="text-emerald-500">📍</span> {t.footer.contact.address}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
            <p>جميع الحقوق محفوظة © 2026 شركة عقار مخرج.</p>
            <p className="mt-2 md:mt-0">صُنع بكل فخر في العراق 🇮🇶</p>
          </div>
        </div>
      </footer>

    </main>
  )
}