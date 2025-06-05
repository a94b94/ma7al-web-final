import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SimilarProducts({
  currentProductId,
  category,
  product,
}: {
  currentProductId: string;
  category: string;
  product: { _id: string; name: string; price: number };
}) {
  const { data: products, error } = useSWR(
    category ? `/api/products/similar?category=${category}&exclude=${currentProductId}` : null,
    fetcher
  );

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const storePhone = "9647701234567";

  const handleSubmitOrder = async () => {
    if (!phone.trim() || !address.trim()) {
      toast.error("يرجى إدخال رقم الهاتف والعنوان الكامل.");
      return;
    }

    const storeId = localStorage.getItem("selectedStoreId");
    if (!storeId) {
      toast.error("⚠️ يرجى اختيار محل قبل إتمام الطلب.");
      return;
    }

    const cart = [
      {
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
      },
    ];

    const total = product.price;
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          address,
          cart,
          total,
          storeId,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ تم تأكيد الطلب بنجاح!");
        setOrderConfirmed(true);

        const message = `🛒 طلب جديد من Ma7al Store\n\n📱 الهاتف: ${phone}\n📍 العنوان: ${address}\n💳 طريقة الدفع: ${
          paymentMethod === "cash" ? "عند الاستلام" : "بطاقة إلكترونية"
        }\n📦 المنتج: ${product.name} بسعر ${product.price.toLocaleString()} د.ع`;

        window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`, "_blank");

        setPhone("");
        setAddress("");
      } else {
        toast.error(data.error || "حدث خطأ أثناء إرسال الطلب.");
      }
    } catch {
      toast.error("❌ فشل في إرسال الطلب، تحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  if (error || !products || products.length === 0) return null;

  return (
    <motion.div className="mt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <motion.h2
        className="text-2xl font-extrabold text-center mb-8 text-indigo-600"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        🌀 منتجات مشابهة قد تهمك
      </motion.h2>

      {/* نموذج الطلب */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mb-10">
        <h3 className="text-lg font-semibold mb-4">📦 تفاصيل الطلب</h3>

        <input
          type="tel"
          placeholder="📱 رقم الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 mb-3 border rounded-lg"
        />

        <textarea
          placeholder="📍 العنوان الكامل"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />

        <div className="space-y-2 mb-6">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
              className="w-4 h-4"
            />
            <span>الدفع عند الاستلام</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              className="w-4 h-4"
              disabled
            />
            <span className="text-gray-400">بطاقة إلكترونية (قريبًا)</span>
          </label>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full transition"
        >
          {loading ? "⏳ جاري إرسال الطلب..." : "✅ تأكيد الطلب وإرسال واتساب"}
        </button>

        {orderConfirmed && (
          <motion.div
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            🎉 تم تأكيد الطلب وسيتم فتح واتساب تلقائيًا لإرسال التفاصيل!
          </motion.div>
        )}
      </div>

      {/* عرض المنتجات */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {products.map((product: any) => (
          <motion.a
            key={product._id}
            href={`/product/${product._id}`}
            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg border"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative h-40">
              <Image
                src={product.image || "/images/default.jpg"}
                alt={product.name}
                fill
                className="object-cover rounded-t-xl"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-blue-600 font-bold">
                {Number(product.price).toLocaleString()} د.ع
              </p>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
}
