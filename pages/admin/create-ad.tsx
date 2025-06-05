import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
}

export default function CreateAdPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState(
    new Date().toISOString().slice(0, 16) // تعيين وقت افتراضي الآن
  );
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // 🟡 تحميل المنتجات من السيرفر
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        toast.error("❌ فشل تحميل المنتجات");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // 🟡 عند إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !title || !description || !expiresAt) {
      return toast.error("❗ جميع الحقول مطلوبة");
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/ads/create", {
        productId: selectedProductId,
        title,
        description,
        expiresAt,
      });

      if (!res.data.success) throw new Error(res.data.message || "فشل الإنشاء");

      toast.success("✅ تم إنشاء الإعلان بنجاح");
      // إعادة تعيين الحقول
      setSelectedProductId("");
      setTitle("");
      setDescription("");
      setExpiresAt(new Date().toISOString().slice(0, 16));
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إنشاء الإعلان");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">📝 إنشاء إعلان جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* اختيار المنتج */}
          <div>
            <label className="block text-sm font-medium mb-1">🔍 اختر المنتج</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={loadingProducts}
            >
              <option value="">{loadingProducts ? "جاري التحميل..." : "اختر منتجاً..."}</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* العنوان */}
          <div>
            <label className="block text-sm font-medium mb-1">📢 عنوان الإعلان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="مثال: عرض خاص على الموبايل"
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium mb-1">📝 وصف مختصر</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="تفاصيل العرض، مثل الخصم أو المميزات"
            />
          </div>

          {/* تاريخ الانتهاء */}
          <div>
            <label className="block text-sm font-medium mb-1">⏳ تاريخ انتهاء العرض</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* زر الحفظ */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "⏳ جارٍ الحفظ..." : "💾 حفظ الإعلان"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
