import Head from "next/head";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-800">
      <Head>
        <title>من نحن - Ma7al Store</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4 text-blue-700">📘 من نحن</h1>
      <p className="text-lg leading-relaxed">
        نحن في <strong>Ma7al Store</strong> نعمل على توفير أحدث الإلكترونيات بأفضل الأسعار.
      </p>
      <p className="mt-4 text-lg">
        رؤيتنا هي أن نكون الوجهة الأولى لعشاق التكنولوجيا في العراق والمنطقة.
      </p>
    </div>
  );
}
