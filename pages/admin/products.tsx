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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("فشل في الاتصال بالخادم");
      const data = await res.json();
      setProducts(data.products || data);
    } catch {
      toast.error("❌ حدث خطأ أثناء جلب المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const localUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const token = localUser ? JSON.parse(localUser).token : null;

      if (!token) {
        toast.error("❌ غير مصرح");
        return;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم حذف المنتج");
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error(data.message || "❌ فشل الحذف");
      }
    } catch {
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
          <table className="w-full min-w-[700px] border text-sm">
            <thead className="bg-gray-100 text-right">
              <tr>
                <th className="p-2 border">الصورة</th>
                <th className="p-2 border">الاسم</th>
                <th className="p-2 border">السعر</th>
                <th className="p-2 border">الفئة</th>
                <th className="p-2 border">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t text-right">
                  <td className="p-2 border">
                    <div className="w-[50px] h-[50px] relative">
                      <Image
                        src={product.image || "/images/default.jpg"}
                        alt={product.name}
                        fill
                        className="rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/default.jpg";
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.price.toLocaleString()} د.ع</td>
                  <td className="p-2 border">{product.category}</td>
                  <td className="p-2 border">
                    <div className="flex gap-3">
                      <Link href={`/admin/edit-product/${product._id}`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">تعديل</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </div>
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
