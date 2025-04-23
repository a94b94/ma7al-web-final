import Link from "next/link";

const categories = [
  { name: "إلكترونيات", slug: "electronics" },
  { name: "هواتف", slug: "phones" },
  { name: "ساعات", slug: "watches" },
  { name: "أجهزة إنترنت", slug: "internet-devices" },
  { name: "كاميرات", slug: "cameras" },
  { name: "إكسسوارات", slug: "accessories" },
];

export default function CategoriesBar() {
  return (
    <div className="bg-[#232f3e] text-white py-2 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex gap-4 px-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="shrink-0 whitespace-nowrap hover:underline text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
