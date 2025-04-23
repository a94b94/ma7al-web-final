import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { ShoppingCart, Eye } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart } = useCart();

  const { data: products, error } = useSWR(
    slug ? `/api/products/category/${slug}` : null,
    fetcher
  );

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success("✅ تم إضافة المنتج إلى السلة!");
  };

  if (error)
    return <p className="text-center text-red-500 mt-10">❌ فشل في جلب المنتجات</p>;
  if (!products)
    return <p className="text-center mt-10 text-gray-600">⏳ جاري تحميل المنتجات...</p>;

  return (
    <div className="bg-[#f9f9f9] min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          🛒 تصفّح قسم <span className="text-blue-600 capitalize">{slug}</span>
        </h1>

        {/* المنتجات */}
        {products.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">لا توجد منتجات حالياً بهذا القسم.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => {
              const hasDiscount = product.discount > 0;
              const finalPrice = hasDiscount
                ? Math.floor(product.price * (1 - product.discount / 100))
                : product.price;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={product.image || "/images/default.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                        خصم {product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col justify-between h-[180px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                      {product.name}
                    </h3>

                    <div className="mb-2">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-bold text-lg">
                            {finalPrice.toLocaleString()} د.ع
                          </span>
                          <span className="line-through text-gray-400 text-sm">
                            {product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-700 font-bold text-lg">
                          {product.price.toLocaleString()} د.ع
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link href={`/product/${product._id}`}>
                        <button className="flex-1 bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-1">
                          <Eye size={16} /> عرض
                        </button>
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                      >
                        <ShoppingCart size={16} /> للسلة
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
