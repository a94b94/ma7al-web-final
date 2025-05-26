// pages/index.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">🎉 مرحبًا بك في Ma7al Store</h1>
      <p className="text-gray-600 mb-6">منصة إدارة وبيع إلكترونيات احترافية.</p>
      <Link
        href="/admin"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full"
      >
        الدخول إلى لوحة التحكم
      </Link>
    </div>
  );
}
