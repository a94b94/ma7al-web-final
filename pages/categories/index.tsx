import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext"; // تأكد من وجود هذا السياق

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  colorClass: string;
  productCount?: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser(); // 👈 سياق المستخدم

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("فشل في جلب الأقسام");
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        setError("❌ حدث خطأ أثناء تحميل الأقسام");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* 🔙 زر الرجوع */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 font-medium transition"
        >
          ← رجوع
        </button>

        {/* ➕ زر إضافة قسم للمشرف فقط */}
        {user?.role === "admin" && (
          <Link
            href="/admin/add-category"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            ➕ إضافة قسم
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold text-center mb-8">📁 جميع الأقسام</h1>

      {error && <p className="text-center text-red-600">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-6 bg-gray-200 animate-pulse h-52"
            ></div>
          ))}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="text-center text-gray-400">لا توجد أقسام حالياً</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {categories.map((cat, idx) => (
            <Link key={cat._id} href={`/category/${cat.slug}`}>
              <div
                className={`rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${cat.colorClass}`}
              >
                <div className="relative w-full h-32 mb-4">
                  <Image
                    src={cat.image || "/images/default.jpg"}
                    alt={cat.name}
                    fill
                    priority={idx === 0}
                    className="rounded-lg object-cover"
                  />
                </div>
                <h2 className="text-xl font-semibold text-center truncate">{cat.name}</h2>
                {typeof cat.productCount === "number" && (
                  <p className="text-sm text-center text-white mt-1">{cat.productCount} منتج</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
