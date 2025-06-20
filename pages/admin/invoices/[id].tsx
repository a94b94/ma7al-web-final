// ✅ صفحة عرض تفاصيل فاتورة الشراء بشكل منسق واحترافي
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  quantity: number;
}

interface InvoiceType {
  _id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  products: Product[];
}

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`/api/invoices/${id}`)
        .then((res) => {
          setInvoice(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("فشل تحميل الفاتورة");
          setLoading(false);
        });
    }
  }, [id]);

  const totalAmount = invoice?.products?.reduce(
    (sum, product) => sum + product.purchasePrice * product.quantity,
    0
  );

  if (loading)
    return <p className="p-4 text-gray-500">⏳ جاري تحميل تفاصيل الفاتورة...</p>;
  if (error || !invoice)
    return (
      <p className="p-4 text-red-500">
        ❌ {error || "لم يتم العثور على الفاتورة"}
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">
          🧾 تفاصيل فاتورة: {invoice.invoiceNumber}
        </h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🖨️ طباعة
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-700">
        <p>
          <strong>المورد:</strong> {invoice.supplierName}
        </p>
        <p>
          <strong>📅 التاريخ:</strong>{" "}
          {new Date(invoice.date).toLocaleDateString("ar-IQ")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">المنتج</th>
              <th className="p-2 border">الباركود</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">سعر الشراء</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.map((product, index) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.barcode}</td>
                <td className="p-2 border">{product.category}</td>
                <td className="p-2 border">
                  {product.purchasePrice.toLocaleString("ar-IQ")} د.ع
                </td>
                <td className="p-2 border text-center">{product.quantity}</td>
                <td className="p-2 border text-center">
                  {(product.purchasePrice * product.quantity).toLocaleString(
                    "ar-IQ"
                  )}{" "}
                  د.ع
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* المجموع وزر الرجوع */}
      <div className="text-sm mt-4 text-right text-gray-700">
        <strong>
          📊 المجموع الكلي: {totalAmount?.toLocaleString("ar-IQ")} د.ع
        </strong>
      </div>

      <div className="mt-6 print:hidden">
        <button
          onClick={() => router.push("/admin/local-invoices")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          🔙 رجوع إلى قائمة الفواتير
        </button>
      </div>
    </div>
  );
}
