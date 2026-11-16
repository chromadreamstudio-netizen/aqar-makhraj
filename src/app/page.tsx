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
  const [file, setFile] = useState<File | null>(null) // حالة الملف المرفوع
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const remainingInstallments = typeof originalPrice === 'number' && typeof paidAmount === 'number' 
    ? originalPrice - paidAmount 
    : 0

  // التعامل مع اختيار الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // دالة الرفع الشاملة (رفع الصورة + حفظ البيانات)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    let uploadedFileUrl = null

    // 1. إذا اختار المستخدم ملف، نرفعه أولاً إلى Supabase Storage
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (!uploadError) {
        // الحصول على الرابط العام للصورة
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName)
        uploadedFileUrl = publicUrlData.publicUrl
      } else {
        console.error('Upload Error:', uploadError)
      }
    }
    
    // 2. إدخال البيانات في جدول leads
    const { error } = await supabase
      .from('leads')
      .insert([{ 
        phone_number: phone, 
        compound_name: compound,
        original_price: originalPrice || null,
        paid_amount: paidAmount || null,
        requires_expat_service: isExpat,
        contract_image_url: uploadedFileUrl // حفظ رابط الصورة
      }])

    setIsSubmitting(false)
    
    if (error) {
      alert('حدث خطأ في النظام. يرجى المحاولة مرة أخرى.')
      console.error(error)
    } else {
      setSubmitSuccess(true)
      const whatsappMsg = encodeURIComponent(`مرحباً عقار مخرج، سجلت وحدتي في مجمع ${compound} وأريد استكمال الإجراءات.`)
      setTimeout(() => {
        window.open(`https://wa.me/964XXXXXXXXXX?text=${whatsappMsg}`, '_blank')
        setIsModalOpen(false)
        setSubmitSuccess(false)
        setFile(null)
      }, 2000)
    }
  }

  // نصوص الموقع (i18n)
  const content = {
    ar: {
      dir: 'rtl',
      nav: { sell: 'عرض وحدتك', buy: 'شراء فرصة', login: 'بوابة المطورين' },
      hero: { 
        title: 'البائع يسترجع فلوسه كاش، والمشتري يربح سعر الطرح القديم.', 
        subtitle: 'لا تخسر غرامات الإلغاء للمطور (15%). نعرض وحدتك المتعثرة بسرية تامة، ونوصلك بمشتري جاهز يكمل الأقساط بنفس عقدك القديم.' 
      },
      modal: {
        title: 'سجل بياناتك المبدئية',
        upload: 'إرفاق صورة العقد / الوصولات (اختياري)',
        expatCheck: 'أنا خارج العراق وأحتاج خدمة الوكالة المصدقة',
      }
    }
  }

  const t = content.ar 

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      
      {/* النافذة المنبثقة (بها رفع الملفات الحقيقي) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold">✕</button>
            <h3 className="text-2xl font-bold mb-6 text-slate-800 text-center">{t.modal.title}</h3>
            
            {submitSuccess ? (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-center font-bold">
                تم الاستلام والتأكيد بنجاح! سيتم تحويلك للواتساب...
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
                
                {/* حقل رفع الملفات الحقيقي */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">{t.modal.upload}</label>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {file && <p className="text-xs text-emerald-600 mt-2">✓ تم اختيار: {file.name}</p>}
                </div>

                <div className="flex items-center gap-2 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <input type="checkbox" id="expat" checked={isExpat} onChange={(e) => setIsExpat(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                  <label htmlFor="expat" className="text-sm font-medium text-slate-700">{t.modal.expatCheck}</label>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-6 shadow-md transition-all">
                  {isSubmitting ? 'جاري الرفع والإرسال...' : 'إرسال والتحويل لواتساب'}
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
              <button onClick={() => setIsModalOpen(true)} className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">{t.nav.sell}</button>
              <Link href="/opportunities" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">{t.nav.buy}</Link>
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
            <span className="inline-block px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold tracking-wide">منصة التنازل الآمن الأولى في العراق</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.2]">{t.hero.title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">{t.hero.subtitle}</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <h2 className="text-2xl font-bold text-center mb-8">احسب موقفك المالي</h2>
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
            <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-600 transition-colors">
              سجل وحدتك الآن (مجانًا للبائع)
            </button>
          </div>
        </div>
      </div>

    </main>
  )
}