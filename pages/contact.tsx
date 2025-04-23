import Head from "next/head";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-800">
      <Head>
        <title>اتصل بنا - Ma7al Store</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4 text-blue-700">📞 اتصل بنا</h1>
      <p className="text-lg leading-relaxed">
        إذا كانت لديك أي استفسارات أو تحتاج إلى مساعدة، لا تتردد في التواصل معنا:
      </p>
      <ul className="mt-4 space-y-2 text-lg">
        <li>📧 البريد الإلكتروني: support@ma7alstore.com</li>
        <li>📱 واتساب: +964 770 000 0000</li>
        <li>📍 العنوان: بغداد - الكرادة - شارع التقنية</li>
      </ul>
    </div>
  );
}
