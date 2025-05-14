// pages/admin/all-products.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

const categories = ["all", "موبايلات", "لابتوبات", "سماعات", "ساعات", "غير مصنّف"];

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/inventory/all", {
        params: { category, search }
      });
      setProducts(res.data);
    } catch {
      toast.error("فشل في جلب المنتجات");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const togglePublish = async (id: string, publish: boolean) => {
    try {
      const endpoint = publish ? "publish" : "unpublish";
      await axios.put(`/api/inventory/${id}/${endpoint}`);
      toast.success(publish ? "✅ تم النشر" : "❎ تم الإلغاء");
      fetchProducts();
    } catch {
      toast.error("فشل في تحديث حالة المنتج");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📋 جميع المنتجات</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat === "all" ? "كل الأقسام" : cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 ابحث باسم المنتج"
          className="border px-3 py-2 rounded text-sm flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">لا توجد نتائج حالياً.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">المنتج</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">السعر</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">تعديل</th>
              <th className="p-2 border">نشر/إلغاء</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product._id}>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.category}</td>
                <td className="p-2 border">{product.purchasePrice.toLocaleString()} د.ع</td>
                <td className="p-2 border">{product.quantity}</td>
                <td className="p-2 border text-center">
                  {product.isPublished ? "✅ منشور" : "❎ غير منشور"}
                </td>
                <td className="p-2 border text-center">
                  <Link
                    href={`/admin/edit-product/${product._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    تعديل
                  </Link>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => togglePublish(product._id, !product.isPublished)}
                    className={`${
                      product.isPublished ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                    } text-white text-xs px-3 py-1 rounded`}
                  >
                    {product.isPublished ? "إلغاء النشر" : "نشر"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
