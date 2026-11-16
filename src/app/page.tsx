'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [originalPrice, setOriginalPrice] = useState<number | ''>('')
  const [paidAmount, setPaidAmount] = useState<number | ''>('')
  
  // حالات النافذة المنبثقة (Modal States)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [compound, setCompound] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const remainingInstallments = typeof originalPrice === 'number' && typeof paidAmount === 'number' 
    ? originalPrice - paidAmount 
    : 0

  // دالة إرسال البيانات إلى Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          phone_number: phone, 
          compound_name: compound,
          original_price: originalPrice || null,
          paid_amount: paidAmount || null
        }
      ])

    setIsSubmitting(false)
    
    if (error) {
      alert('حدث خطأ في الإرسال، يرجى المحاولة مرة أخرى.')
      console.error(error)
    } else {
      setSubmitSuccess(true)
      setTimeout(() => {
        setIsModalOpen(false)
        setSubmitSuccess(false)
        setPhone('')
        setCompound('')
      }, 3000)
    }
  }

  const content = {
    ar: {
      dir: 'rtl',
      nav: { sell: 'عرض وحدتك', buy: 'شراء فرصة', login: 'تسجيل الدخول' },
      hero: { 
        badge: 'منصة التنازل الآمن الأولى في العراق',
        title: 'البائع يسترجع فلوسه كاش، والمشتري يربح سعر الطرح القديم.', 
        subtitle: 'لا تخسر غرامات الإلغاء للمطور. نعرض وحدتك المتعثرة بسرية تامة، ونوصلك بمشتري جاهز يكمل الأقساط بنفس عقدك القديم.' 
      },
      calc: { 
        title: 'احسب موقفك المالي في دقيقة', 
        price: 'سعر العقد الأصلي (دولار أو دينار)', 
        paid: 'ما تم دفعه للمطور كاش', 
        return: 'البائع يسترجع (كاش)', 
        remaining: 'المشتري يكمل أقساط', 
        btn: 'سجل وحدتك الآن (مجانًا للبائع)' 
      },
      modal: {
        title: 'أكمل بياناتك لنتواصل معك',
        compound: 'اسم المجمع السكني (مثل: بوابة العراق، بسماية)',
        phone: 'رقم الهاتف (واتساب)',
        submit: 'إرسال الطلب',
        loading: 'جاري الإرسال...',
        success: 'تم الاستلام! سنتواصل معك خلال 24 ساعة.'
      }
    },
    en: {
      dir: 'ltr',
      nav: { sell: 'Sell Unit', buy: 'Buy Unit', login: 'Login' },
      hero: { 
        badge: 'Iraq\'s #1 Safe Real Estate Exit Platform',
        title: 'Sellers recover cash, Buyers get the old contract price.', 
        subtitle: 'Don\'t lose developer cancellation fees. We list your distressed unit confidentially and connect you with a ready buyer to continue the installments.' 
      },
      calc: { 
        title: 'Calculate Your Position', 
        price: 'Original Contract Price (USD/IQD)', 
        paid: 'Total Paid to Developer', 
        return: 'Seller Recovers (Cash)', 
        remaining: 'Buyer\'s Remaining Installments', 
        btn: 'List Your Unit Now (Free for Sellers)' 
      },
      modal: {
        title: 'Complete your details',
        compound: 'Compound Name (e.g., Bismayah)',
        phone: 'Phone Number (WhatsApp)',
        submit: 'Submit Request',
        loading: 'Submitting...',
        success: 'Received! We will contact you within 24 hours.'
      }
    }
  }

  const t = content[lang]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-all duration-300 relative" dir={t.dir}>
      
      {/* النافذة المنبثقة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 text-center">{t.modal.title}</h3>
            
            {submitSuccess ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-bold">
                {t.modal.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.modal.compound}</label>
                  <input 
                    required
                    type="text" 
                    value={compound}
                    onChange={(e) => setCompound(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.modal.phone}</label>
                  <input 
                    required
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                    dir="ltr"
                    placeholder="+964..."
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all mt-4 disabled:opacity-70"
                >
                  {isSubmitting ? t.modal.loading : t.modal.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* شريط التنقل الاحترافي */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <Image 
                src="/logo.jpg" 
                alt="Aqar Makhraj Logo" 
                width={160} 
                height={50} 
                className="object-contain"
                priority
              />
            </div>
            
            {/* تم حل مشكلة تداخل النصوص هنا باستخدام gap-8 بدلاً من space-x */}
            <div className="hidden md:flex items-center gap-8 px-6">
              <button className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">{t.nav.sell}</button>
              <button className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">{t.nav.buy}</button>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                {t.nav.login}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* قسم الهيرو */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <span className="inline-block px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold tracking-wide">
              {t.hero.badge}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.2]">
              {t.hero.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">{t.calc.title}</h2>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.calc.price}</label>
                <input 
                  type="number" 
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-lg"
                  placeholder="مثال: 150000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.calc.paid}</label>
                <input 
                  type="number" 
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-lg"
                  placeholder="مثال: 40000"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm font-semibold text-slate-500 mb-2">{t.calc.return}</p>
                <p className="text-3xl font-extrabold text-emerald-600">
                  {paidAmount ? paidAmount.toLocaleString() : '0'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-sm font-semibold text-slate-500 mb-2">{t.calc.remaining}</p>
                <p className="text-3xl font-extrabold text-blue-600">
                  {remainingInstallments > 0 ? remainingInstallments.toLocaleString() : '0'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              {t.calc.btn}
            </button>
          </div>

        </div>
      </div>

    </main>
  )
}