import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* الشريط الجانبي */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">🛍️ لوحة التحكم</h2>
        <ul className="space-y-2">
          <li><a href="/admin" className="hover:text-yellow-300">🏠 الرئيسية</a></li>
          <li><a href="/admin/products" className="hover:text-yellow-300">📦 المنتجات</a></li>
          <li><a href="/admin/orders" className="hover:text-yellow-300">🧾 الطلبات</a></li>
          <li><a href="/admin/add-product" className="hover:text-yellow-300">➕ منتج جديد</a></li>
        </ul>
      </aside>

      {/* محتوى الصفحة */}
      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
