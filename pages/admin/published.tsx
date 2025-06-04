"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

type Product = {
  _id: string;
  name: string;
  category: string;
  purchasePrice: number;
  quantity: number;
  image?: string;
};

export default function PublishedProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished();
  }, []);

  const fetchPublished = async () => {
    try {
      const res = await axios.get("/api/inventory?published=true");
      setProducts(res.data);
    } catch {
      toast.error("❌ فشل تحميل المنتجات المنشورة");
    } finally {
      setLoading(false);
    }
  };

  const unpublishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/unpublish`);
      toast.success("❎ تم إلغاء نشر المنتج");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("فشل في إلغاء النشر");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">🛒 المنتجات المنشورة في المتجر</h1>

      {loading ? (
        <p className="text-gray-500">⏳ جاري تحميل المنتجات...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">لا توجد منتجات منشورة حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border text-sm text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">الصورة</th>
                <th className="p-2 border">المنتج</th>
                <th className="p-2 border">القسم</th>
                <th className="p-2 border">السعر</th>
                <th className="p-2 border">الكمية</th>
                <th className="p-2 border">تعديل</th>
                <th className="p-2 border">إلغاء النشر</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-2 border">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-[50px] h-[50px] bg-gray-200 rounded" />
                    )}
                  </td>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.category}</td>
                  <td className="p-2 border">
                    {product.purchasePrice.toLocaleString()} د.ع
                  </td>
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
        </div>
      )}
    </div>
  );
}
