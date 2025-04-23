import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import SimilarProducts from "@/components/SimilarProducts";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => setProduct(data));
    }
  }, [id]);

  if (!product) {
    return <p className="text-center py-20 text-gray-500">⏳ جاري تحميل المنتج...</p>;
  }

  const discountPrice = product.discount
    ? Math.floor(product.price * (1 - product.discount / 100))
    : product.price;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    toast.success("✅ تم إضافة المنتج إلى السلة!");
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6 text-gray-800 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 p-6 rounded-xl shadow"
        >
          <Image
            src={product.image || "/images/default.jpg"}
            alt={product.name}
            width={500}
            height={500}
            className="object-contain mx-auto rounded-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="text-lg">{renderStars(product.rating || 4)}</div>

          <div className="flex items-center gap-4">
            <p className="text-blue-700 text-2xl font-semibold">
              💵 {discountPrice.toLocaleString()} د.ع
            </p>
            {product.discount > 0 && (
              <>
                <span className="line-through text-gray-400 text-lg">
                  {product.price.toLocaleString()} د.ع
                </span>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  خصم {product.discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description || "لا يوجد وصف متاح لهذا المنتج."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full"
            >
              🛒 أضف إلى السلة
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outline"
              className="rounded-full px-6 py-3"
            >
              ← رجوع
            </Button>
          </div>
        </motion.div>
      </div>

      {product.category && (
        <div className="mt-20">
          <SimilarProducts currentProductId={product._id} category={product.category} />
        </div>
      )}
    </div>
  );
}
