// pages/admin/published.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function PublishedProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/inventory?published=true").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const unpublishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/unpublish`);
      toast.success("❎ تم إلغاء نشر المنتج");
      setProducts((prev) => prev.filter((p: any) => p._id !== id));
    } catch (err) {
      toast.error("فشل في إلغاء النشر");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">🛒 المنتجات المنشورة في المتجر</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">لا توجد منتجات منشورة حالياً.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">المنتج</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">السعر</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">تعديل</th>
              <th className="p-2 border">إلغاء النشر</th>
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
                  <Link
                    href={`/admin/edit-product/${product._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    تعديل
                  </Link>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => unpublishProduct(product._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                  >
                    إلغاء النشر
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
