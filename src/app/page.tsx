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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const remainingInstallments = typeof originalPrice === 'number' && typeof paidAmount === 'number' 
    ? originalPrice - paidAmount 
    : 0

  // دالة الإرسال مع التحويل لواتساب
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('leads')
      .insert([{ 
        phone_number: phone, 
        compound_name: compound,
        original_price: originalPrice || null,
        paid_amount: paidAmount || null,
        requires_expat_service: isExpat
      }])

    setIsSubmitting(false)
    
    if (error) {
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } else {
      setSubmitSuccess(true)
      // تحويل البائع مباشرة لمحادثة واتساب مع رقم الشركة
      const whatsappMsg = encodeURIComponent(`مرحباً عقار مخرج، سجلت وحدتي في مجمع ${compound} وأريد استكمال رفع المستندات.`)
      setTimeout(() => {
        window.open(`https://wa.me/964XXXXXXXXXX?text=${whatsappMsg}`, '_blank')
        setIsModalOpen(false)
        setSubmitSuccess(false)
      }, 2000)
    }
  }

  const content = {
    ar: {
      dir: 'rtl',
      nav: { sell: 'عرض وحدتك', buy: 'شراء فرصة', login: 'بوابة المطورين' },
      hero: { 
        title: 'البائع يسترجع فلوسه كاش، والمشتري يربح سعر الطرح القديم.', 
        subtitle: 'لا تخسر غرامات الإلغاء للمطور (15%). نعرض وحدتك المتعثرة بسرية تامة، ونوصلك بمشتري جاهز يكمل الأقساط بنفس عقدك القديم.' 
      },
      features: {
        title: 'حلول حصرية للسوق العراقي',
        f1: { title: 'حاسبة فرق الدينار/الدولار', desc: 'نوفر لك الحسبة الدقيقة لفرق العملة بين يوم التعاقد واليوم لضمان أعلى شفافية.' },
        f2: { title: 'بوابة المغتربين', desc: 'أنت خارج العراق؟ نوفر خدمة التحويل بالوكالة المصدقة عبر مستشارنا القانوني.' },
        f3: { title: 'تجزئة الفرصة', desc: 'للعقود الكبيرة، نتيح لمستثمرين اثنين الدخول معاً لاقتناص الفرصة مناصفة.' },
        f4: { title: 'حسابات المطورين', desc: 'نظام B2B لإدارات المبيعات لرفع عقود عملائهم المتعثرين لتوفير سيولة فورية للشركة.' }
      },
      comparison: {
        title: 'إيه الفرق بينا وبين السوق العادي (الدلالين)؟',
        headers: ['الميزة', 'عقار مَخْرَج', 'السوق العادي'],
        rows: [
          ['العمولة', 'مجاناً للبائع تماماً', 'يأخذون 2% من الطرفين'],
          ['السعر', 'بدون فرق (أوفر) وهمي', 'مبالغة في السعر والسرقفلية'],
          ['الأمان', 'تدقيق كامل للوصولات', 'كلام مرسل بدون إثبات'],
          ['الإجراءات', 'نرافقك حتى التوقيع بالشركة', 'المكتب العقاري غير مسؤول']
        ]
      },
      modal: {
        title: 'سجل بياناتك المبدئية',
        upload: 'إرفاق صور العقد والوصولات (اختياري الآن)',
        expatCheck: 'أنا خارج العراق وأحتاج خدمة الوكالة المصدقة',
      }
    }
  }

  const t = content.ar // سنثبت العربية الآن لسرعة الإنجاز

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* النافذة المنبثقة المحدثة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold">✕</button>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 text-center">{t.modal.title}</h3>
            
            {submitSuccess ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-bold">
                تم الاستلام! سيتم تحويلك للواتساب لاستكمال المستندات...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">اسم المجمع السكني</label>
                  <input required type="text" value={compound} onChange={(e) => setCompound(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">رقم الهاتف (واتساب)</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-left" dir="ltr" placeholder="+964..." />
                </div>
                
                {/* زر وهمي لرفع الملفات (سيتم ربطه لاحقاً بالـ Storage) */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50">
                  <span className="text-sm text-slate-500">📁 {t.modal.upload}</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="expat" checked={isExpat} onChange={(e) => setIsExpat(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <label htmlFor="expat" className="text-sm font-medium text-slate-700">{t.modal.expatCheck}</label>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4">
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال والتحويل لواتساب'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* شريط التنقل */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <div className="relative w-40 h-14">
                <Image src="/logo.jpg" alt="Aqar Makhraj Logo" fill className="object-contain mix-blend-multiply" priority />
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8 px-6">
              <button onClick={() => setIsModalOpen(true)} className="text-slate-600 hover:text-emerald-600 font-medium font-bold transition-colors">{t.nav.sell}</button>
              <Link href="/opportunities" className="text-slate-600 hover:text-emerald-600 font-medium font-bold transition-colors">{t.nav.buy}</Link>
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
              {t.nav.login}
            </button>
          </div>
        </div>
      </nav>

      {/* الهيرو والحاسبة */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.2]">{t.hero.title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">{t.hero.subtitle}</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <h2 className="text-2xl font-bold text-center mb-8">احسب موقفك المالي</h2>
            <div className="space-y-4 mb-6">
              <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} className="w-full bg-slate-50 border rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-lg" placeholder="سعر العقد الأصلي" />
              <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} className="w-full bg-slate-50 border rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-lg" placeholder="ما تم دفعه كاش" />
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
            <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-600 transition-colors">
              سجل وحدتك الآن (مجانًا للبائع)
            </button>
          </div>
        </div>
      </div>

      {/* قسم الميزات الحصرية (الزوايا الذهبية) */}
      <div className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12">{t.features.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[t.features.f1, t.features.f2, t.features.f3, t.features.f4].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg mb-4 flex items-center justify-center text-emerald-600 text-xl font-black">{idx + 1}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* جدول المقارنة الاحترافي */}
      <div className="py-20 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center mb-12">{t.comparison.title}</h2>
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-slate-200">
          <table className="w-full text-right bg-white">
            <thead className="bg-slate-900 text-white">
              <tr>
                {t.comparison.headers.map((header, i) => (
                  <th key={i} className="p-4 font-bold text-lg">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.comparison.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 bg-slate-50 w-1/4">{row[0]}</td>
                  <td className="p-4 text-emerald-700 font-bold w-2/5 flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> {row[1]}
                  </td>
                  <td className="p-4 text-slate-500 w-2/5 flex items-center gap-2">
                    <span className="text-red-400">✕</span> {row[2]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  )
}