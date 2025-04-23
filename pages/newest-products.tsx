
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NewestProductsPage() {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products/newest")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || [])); // ✅ التصحيح هنا
  }, []);

  return (
    <div className="min-h-screen bg-white py-10 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
        🆕 المنتجات التي وصلت حديثاً
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد منتجات حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product._id}
              className="bg-white border rounded-xl shadow-md p-4 flex flex-col items-center text-center"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className="object-contain mb-4 rounded"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-blue-600 font-bold mb-2">
                {product.price.toLocaleString()} د.ع
              </p>
              <Button
                className="w-full rounded-full"
                onClick={() => router.push(`/product/${product._id}`)}
              >
                عرض التفاصيل
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}