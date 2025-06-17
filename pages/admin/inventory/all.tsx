"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  _id: string;
  name: string;
  category: string;
  purchasePrice: number;
  quantity: number;
  isPublished: boolean;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "unpublished">("all");

  useEffect(() => {
    axios.get("/api/inventory").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (filter === "published") return p.isPublished;
    if (filter === "unpublished") return !p.isPublished;
    return true;
  });

  const publishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/publish`);
      toast.success("✅ تم نشر المنتج");
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isPublished: true } : p))
      );
    } catch {
      toast.error("❌ فشل في النشر");
    }
  };

  const unpublishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/unpublish`);
      toast.success("📦 تم إلغاء النشر");
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isPublished: false } : p))
      );
    } catch {
      toast.error("❌ فشل في إلغاء النشر");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 إدارة المنتجات في المخزن</h1>

      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Link
            href="/admin/purchase"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            ➕ إنشاء فاتورة شراء يدويًا
          </Link>

          <Link
            href="/admin/inventory/import"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            📤 رفع فاتورة شراء
          </Link>
        </div>

        <select
          className="text-sm border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">عرض الكل</option>
          <option value="published">✅ المنشور فقط</option>
          <option value="unpublished">❌ غير المنشور فقط</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد منتجات تطابق الفلتر المختار.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">المنتج</th>
                <th className="p-2 border">القسم</th>
                <th className="p-2 border">السعر</th>
                <th className="p-2 border">الكمية</th>
                <th className="p-2 border">الحالة</th>
                <th className="p-2 border">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="p-2 border">{product.name}</td>
                    <td className="p-2 border">{product.category}</td>
                    <td className="p-2 border">{product.purchasePrice.toLocaleString()} د.ع</td>
                    <td className="p-2 border">{product.quantity}</td>
                    <td className="p-2 border text-center">
                      {product.isPublished ? (
                        <span className="text-green-600 font-semibold">✅ منشور</span>
                      ) : (
                        <span className="text-gray-500">❌ غير منشور</span>
                      )}
                    </td>
                    <td className="p-2 border text-center">
                      {product.isPublished ? (
                        <button
                          onClick={() => unpublishProduct(product._id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                        >
                          إلغاء النشر
                        </button>
                      ) : (
                        <button
                          onClick={() => publishProduct(product._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                        >
                          نشر
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
