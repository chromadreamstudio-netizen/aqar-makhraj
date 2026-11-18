'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900" dir="rtl">
      {/* شريط التنقل المبسط */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="relative w-40 h-16"><Image src="/logo.jpg" alt="عقار مخرج" fill className="object-contain mix-blend-multiply" priority /></div>
            </Link>
            <Link href="/" className="text-slate-500 hover:text-emerald-600 font-bold transition-colors">
              العودة للرئيسية &rarr;
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="mb-10 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">الشروط والأحكام</h1>
            <p className="text-slate-500 font-medium">آخر تحديث: 2026</p>
          </div>

          <div className="space-y-8 text-slate-600 leading-relaxed font-medium">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. قبول الشروط</h2>
              <p>باستخدامك لمنصة "عقار مَخْرَج"، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يُرجى عدم استخدام المنصة.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. دور المنصة</h2>
              <p>تعمل منصة "عقار مَخْرَج" كوسيط تقني يربط بين البائعين المتعثرين في الأقساط العقارية وبين المشترين/المستثمرين الراغبين في اقتناص الفرص بالسعر القديم. نحن نسهل إجراءات التنازل القانونية في مقر الشركة المطورة.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. التزامات البائع</h2>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>يجب أن تكون المعلومات والأرقام المقدمة دقيقة وموثقة بالوصولات الرسمية.</li>
                <li>يوافق البائع على بيع الوحدة بقيمة ما دفعه بالضبط (بدون سرقفلية/أوفر).</li>
                <li>المنصة لا تتقاضى أي رسوم أو عمولات من البائع. الخدمة مجانية بالكامل للبائع.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. التزامات المشتري والعمولات</h2>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>يجب أن يكون المشتري قادراً مالياً على دفع المبلغ المستحق نقداً للبائع عند التنازل.</li>
                <li>يلتزم المشتري بدفع <strong>عمولة وساطة قدرها 1.5%</strong> من إجمالي سعر الوحدة للمنصة.</li>
                <li>تُستحق العمولة وتُدفع <strong>فقط عند إتمام التنازل القانوني رسمياً</strong>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. صحة المستندات</h2>
              <p>نحن نبذل قصارى جهدنا للتحقق من صحة العقود والإيصالات المرفوعة على المنصة. ومع ذلك، تقع المسؤولية النهائية للتأكد من الموقف القانوني للعقار على عاتق الطرفين أثناء إجراءات التنازل في مقر الشركة المطورة.</p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. التعديلات</h2>
              <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية من خلال تحديث هذه الصفحة.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}