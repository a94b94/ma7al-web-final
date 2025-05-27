import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("فشل في الاتصال بالخادم");
        const data = await res.json();
        setProducts(data.products || data); // دعم استجابة `{ products: [...] }` أو `[...]`
      } catch (err) {
        toast.error("❌ حدث خطأ أثناء جلب المنتجات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      const token = typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")?.token
        : null;

      if (!token) {
        toast.error("❌ غير مصرح");
        return;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("✅ تم حذف المنتج");
        setProducts(products.filter((p) => p._id !== id));
      } else {
        toast.error(data.message || "❌ فشل الحذف");
      }
    } catch (err) {
      toast.error("⚠️ خطأ أثناء تنفيذ الحذف");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 إدارة المنتجات</h1>

      <div className="flex justify-end mb-4">
        <Link href="/admin/add-product">
          <span className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
            ➕ منتج جديد
          </span>
        </Link>
      </div>

      {loading ? (
        <p className="text-center">⏳ جارٍ تحميل المنتجات...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border">
            <thead>
              <tr className="bg-gray-100 text-right">
                <th className="p-2">الصورة</th>
                <th className="p-2">الاسم</th>
                <th className="p-2">السعر</th>
                <th className="p-2">الفئة</th>
                <th className="p-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t text-right">
                  <td className="p-2">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/default.jpg";
                      }}
                    />
                  </td>
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">{product.price.toLocaleString()} د.ع</td>
                  <td className="p-2">{product.category}</td>
                  <td className="p-2 flex gap-2">
                    <Link href={`/admin/edit-product/${product._id}`}>
                      <span className="text-blue-600 hover:underline cursor-pointer">تعديل</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
