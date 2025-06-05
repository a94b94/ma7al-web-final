import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  colorClass: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <h1 className="text-3xl font-bold text-center mb-8">📁 جميع الأقسام</h1>

      {loading && <p className="text-center text-gray-500">🔄 جاري تحميل الأقسام...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-center text-gray-400">لا توجد أقسام حالياً</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {categories.map((cat, idx) => (
          <Link key={cat._id} href={`/category/${cat.slug}`}>
            <div
              className={`rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition ${cat.colorClass}`}
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
