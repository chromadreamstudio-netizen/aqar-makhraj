'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

interface Property {
  id: string
  compound_name: string
  city?: string | null
  area_sqm?: number | null
  floor?: string | null
  original_price: number | null
  paid_amount: number | null
  monthly_installment?: number | null
  financing_type?: string | null
  description?: string | null
  photo_urls?: string[] | null
  created_at: string
}

const WHATSAPP_NUMBER = '9647726394755'

function isIQDProperty(originalPrice?: number | null, paidAmount?: number | null): boolean {
  return (originalPrice || 0) >= 5_000_000 || (paidAmount || 0) >= 5_000_000
}

function formatMoney(amount: number | null | undefined, iqd: boolean): string {
  const val = Number(amount || 0)
  if (iqd) {
    return `${val.toLocaleString('en-US')} د.ع`
  }
  return `$${val.toLocaleString('en-US')}`
}

function PropertyCard({
  prop,
  onBuyRequest,
}: {
  prop: Property
  onBuyRequest: (prop: Property) => void
}) {
  const photos = Array.isArray(prop.photo_urls)
    ? prop.photo_urls.filter((url) => typeof url === 'string' && url.trim().length > 0)
    : []
  const [photoIdx, setPhotoIdx] = useState(0)

  const iqd = isIQDProperty(prop.original_price, prop.paid_amount)
  const remaining = Math.max(0, (prop.original_price || 0) - (prop.paid_amount || 0))

  const prevPhoto = () => setPhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  const nextPhoto = () => setPhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* معرض الصور */}
      <div className="relative h-56 w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[photoIdx]}
              alt={prop.compound_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label="الصورة السابقة"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                >
                  &#8250;
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label="الصورة التالية"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                >
                  &#8249;
                </button>
                <span className="absolute bottom-3 left-3 bg-slate-900/75 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {photoIdx + 1} / {photos.length}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl mb-2">
              م
            </div>
            <span className="text-sm font-bold text-white">{prop.compound_name}</span>
            <span className="text-xs text-slate-400 mt-1">عرض معتمد — بيع صامت</span>
          </div>
        )}

        {/* الشارات العلوية */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow">
            فرصة معتمدة
          </span>
          {prop.city && (
            <span className="px-3 py-1 bg-slate-900/80 text-white text-xs font-bold rounded-full">
              {prop.city}
            </span>
          )}
        </div>
      </div>

      {/* العنوان والمواصفات */}
      <div className="bg-slate-50 p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
            {prop.compound_name}
          </h3>
          {prop.financing_type && (
            <span className="shrink-0 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold rounded-lg">
              {prop.financing_type}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-slate-600">
          {prop.area_sqm ? (
            <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              المساحة: {prop.area_sqm} م²
            </span>
          ) : null}
          {prop.floor ? (
            <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              الطابق: {prop.floor}
            </span>
          ) : null}
          <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            سعر العقد: {formatMoney(prop.original_price, iqd)}
          </span>
        </div>
      </div>

      {/* الأرقام المالية والوصف */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600 text-sm font-semibold">المطلوب كاش (للبائع)</span>
            <span className="text-xl font-black text-emerald-600">
              {formatMoney(prop.paid_amount, iqd)}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600 text-sm font-semibold">المتبقي أقساط (للشركة)</span>
            <span className="text-xl font-black text-blue-600">
              {formatMoney(remaining, iqd)}
            </span>
          </div>

          {prop.monthly_installment ? (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">القسط الشهري / الدفعة</span>
              <span className="font-bold text-slate-800">
                {formatMoney(prop.monthly_installment, iqd)}
              </span>
            </div>
          ) : null}

          {prop.description ? (
            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {prop.description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onBuyRequest(prop)}
          className="w-full mt-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md"
        >
          طلب شراء / حجز معاينة رسمية
        </button>
      </div>
    </div>
  )
}

export default function Opportunities() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('الكل')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select(
        'id, compound_name, city, area_sqm, floor, original_price, paid_amount, monthly_installment, financing_type, description, photo_urls, created_at'
      )
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (!error) setProperties(data || [])
    setIsLoading(false)
  }

  const cities = useMemo(() => {
    const list = properties
      .map((p) => (p.city || '').trim())
      .filter((c) => c.length > 0)
    return ['الكل', ...Array.from(new Set(list))]
  }, [properties])

  const filteredProperties = useMemo(() => {
    if (selectedCity === 'الكل') return properties
    return properties.filter((p) => (p.city || '').trim() === selectedCity)
  }, [properties, selectedCity])

  const handleBuyRequest = (prop: Property) => {
    const cityLabel = prop.city ? ` - ${prop.city}` : ''
    const refCode = prop.id.slice(0, 8).toUpperCase()
    const message = encodeURIComponent(
      `مرحباً عقار مخرج، أنا مستثمر جاهز ومهتم باقتناص الفرصة المعروضة في (${prop.compound_name}${cityLabel}) [كود: ${refCode}]. أرجو تزويدي بالتفاصيل وآلية التنازل الرسمي.`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      <nav className="bg-slate-900 text-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-sm">
              م
            </div>
            <h1 className="font-bold text-xl text-white">الفرص المتاحة (معتمدة)</h1>
          </div>
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition-colors text-sm font-semibold border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            العودة للرئيسية &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4">
            موثقة ومراجعة قانونياً — بيع صامت بدون سرقفلية
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            اقتنص فرصتك الآن
          </h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto text-lg">
            عقارات بسعر الطرح القديم، ادفع الكاش للبائع وأكمل الأقساط مع الشركة بضمان قانوني كامل وتنازل رسمي بمقر المطور.
          </p>
        </div>

        {/* فلتر المدن */}
        {!isLoading && cities.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-colors border ${
                  selectedCity === city
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-lg font-semibold">
              لا توجد فرص متاحة في الوقت الحالي.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => (
              <PropertyCard key={prop.id} prop={prop} onBuyRequest={handleBuyRequest} />
            ))}
          </div>
        )}

        {/* نموذج تسجيل الطلب الخاص VIP */}
        <div className="mt-20 bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4 relative z-10">
            لم تجد الفرصة المناسبة لميزانيتك؟
          </h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto font-medium relative z-10 leading-relaxed">
            سوق العقارات يتحرك بسرعة، وأفضل الفرص تُباع وتُحجز قبل نشرها على المنصة. سجل طلبك الخاص وسيقوم فريقنا بالبحث وتوفير العرض المناسب لك سراً خلال 48 ساعة.
          </p>
          <button
            type="button"
            onClick={() => {
              const msg = encodeURIComponent(
                'مرحباً، أبحث عن فرصة استثمارية بمواصفات معينة (المجمع/الميزانية) ولم أجدها في الموقع. أرجو المساعدة بتوفيرها.'
              )
              window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
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