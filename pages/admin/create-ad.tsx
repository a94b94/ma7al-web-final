"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";

export default function CreateAdPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [countdownHours, setCountdownHours] = useState(24);

  useEffect(() => {
    axios.get("/api/products").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const handleSubmit = async () => {
    if (!selectedProductId || !title || !description) {
      toast.error("يرجى تعبئة جميع الحقول");
      return;
    }

    try {
      await axios.post("/api/ads", {
        productId: selectedProductId,
        title,
        description,
        countdownHours,
      });
      toast.success("✅ تم إنشاء الإعلان بنجاح");
      setSelectedProductId("");
      setTitle("");
      setDescription("");
      setCountdownHours(24);
    } catch (error) {
      toast.error("فشل في إنشاء الإعلان");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">📝 إنشاء إعلان جديد</h1>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">اختر منتجًا:</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- اختر المنتج --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">عنوان الإعلان:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">وصف قصير:</label>
          <textarea
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">المدة (بالساعات):</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={countdownHours}
            onChange={(e) => setCountdownHours(Number(e.target.value))}
            min={1}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          إنشاء الإعلان
        </button>
      </div>
    </AdminLayout>
  );
}
