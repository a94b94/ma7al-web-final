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
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !title || !description || !expiresAt) {
      return toast.error("يرجى ملء جميع الحقول");
    }
    setLoading(true);
    try {
      await axios.post("/api/ads", {
        productId: selectedProductId,
        title,
        description,
        expiresAt,
      });
      toast.success("✅ تم إنشاء الإعلان بنجاح");
      setTitle("");
      setDescription("");
      setExpiresAt("");
      setSelectedProductId("");
    } catch (err) {
      toast.error("حدث خطأ أثناء إنشاء الإعلان");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">📝 إنشاء إعلان جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">🔍 اختر المنتج</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">اختر منتجاً...</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">📢 عنوان الإعلان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">📝 وصف مختصر</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">⏳ تاريخ انتهاء العرض</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "...جارٍ الحفظ" : "💾 حفظ الإعلان"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
