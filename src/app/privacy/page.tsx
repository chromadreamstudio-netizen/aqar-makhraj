'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">سياسة الخصوصية</h1>
            <p className="text-slate-500 font-medium">آخر تحديث: {new Date().toLocaleDateString('ar-IQ')}</p>
          </div>

          <div className="space-y-8 text-slate-600 leading-relaxed font-medium">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. مقدمة</h2>
              <p>نحن في "عقار مَخْرَج" نلتزم بحماية خصوصية بياناتك. تشرح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدامك لمنصتنا لبيع أو شراء العقارات المتعثرة.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. المعلومات التي نجمعها</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>معلومات الاتصال (مثل رقم الواتساب).</li>
                <li>بيانات العقار (اسم المجمع، المبالغ المدفوعة، السعر الأصلي).</li>
                <li>المستندات المرفقة (صور العقود وإيصالات الدفع لغرض التحقق).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. كيف نستخدم معلوماتك؟</h2>
              <p>نستخدم معلوماتك للأغراض التالية:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>تقييم العرض العقاري والتحقق من صحة الأرقام.</li>
                <li>التواصل معك عبر الواتساب لاستكمال الإجراءات.</li>
                <li>عرض العقار للمشترين المحتملين <strong>(بشكل مجهول الهوية وبدون ذكر اسمك أو رقم هاتفك)</strong>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. السرية والخروج الصامت</h2>
              <p>نحن نعتمد نظام "البيع الصامت". لن يتم نشر بياناتك الشخصية (اسمك أو رقم هاتفك) للعموم. نحن نعمل كوسيط ولا نكشف عن هويتك إلا للمشتري الجاد أثناء إجراءات التنازل الرسمية في مقر الشركة المطورة.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. مشاركة البيانات</h2>
              <p>لن نقوم ببيع أو تأجير بياناتك لأي طرف ثالث. تتم مشاركة البيانات فقط مع:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>المشترين المحققين (بيانات العقار فقط).</li>
                <li>الجهات القانونية إذا تطلب الأمر ذلك وفقاً للقانون العراقي.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}