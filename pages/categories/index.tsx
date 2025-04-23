
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

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">📁 جميع الأقسام</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link key={cat._id} href={`/category/${cat.slug}`}>
            <div className={`rounded-xl p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition ${cat.colorClass}`}>
              <div className="relative w-full h-32 mb-4">
                <Image
                  src={cat.image || "/images/default.jpg"}
                  alt={cat.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
              <h2 className="text-xl font-semibold text-center">{cat.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
