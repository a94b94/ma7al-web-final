// pages/admin/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/inventory").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const publishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/publish`);
      toast.success("✅ تم نشر المنتج");
      setProducts((prev) => prev.filter((p: any) => p._id !== id));
    } catch (err) {
      toast.error("فشل في النشر");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📦 المنتجات في المخزن (غير منشورة)</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">لا توجد منتجات غير منشورة حالياً.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">المنتج</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">سعر الشراء</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">نشر</th>
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
                  <button
                    onClick={() => publishProduct(product._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    نشر
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
