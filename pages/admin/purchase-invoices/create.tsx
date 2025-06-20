// ✅ صفحة: /admin/purchase-invoices/create.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { savePendingPurchaseInvoice } from "@/lib/db/offlineStore";

export default function CreatePurchaseInvoicePage() {
  const router = useRouter();
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  const addEmptyProduct = () => {
    setProducts((prev) => [
      ...prev,
      { name: "", barcode: "", category: "", purchasePrice: 0, quantity: 1 },
    ]);
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setProducts((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!supplierName || !invoiceNumber || products.length === 0) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const invoiceData = {
      supplierName,
      invoiceNumber,
      date: date || new Date().toISOString(),
      products,
    };

    try {
      await axios.post("/api/purchase-invoice/add", invoiceData);
      toast.success("✅ تم حفظ فاتورة الشراء!");
      router.push("/admin/purchase-invoices");
    } catch (error) {
      if (!navigator.onLine) {
        await savePendingPurchaseInvoice(invoiceData);
        toast.success("💾 تم حفظ الفاتورة مؤقتًا بدون إنترنت، وسيتم مزامنتها تلقائيًا عند توفر الاتصال");
        router.push("/admin/purchase-invoices");
      } else {
        toast.error("❌ فشل الحفظ، حاول مرة أخرى");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">➕ إنشاء فاتورة شراء</h1>

      <div className="grid gap-4 mb-4">
        <input
          type="text"
          placeholder="اسم المورد"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="رقم الفاتورة"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <h2 className="text-lg font-semibold mb-2">📦 المنتجات</h2>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="grid grid-cols-6 gap-2 items-center">
            <input
              type="text"
              placeholder="الاسم"
              value={product.name}
              onChange={(e) => updateProduct(index, "name", e.target.value)}
              className="border p-1 rounded"
            />
            <input
              type="text"
              placeholder="الباركود"
              value={product.barcode}
              onChange={(e) => updateProduct(index, "barcode", e.target.value)}
              className="border p-1 rounded"
            />
            <input
              type="text"
              placeholder="القسم"
              value={product.category}
              onChange={(e) => updateProduct(index, "category", e.target.value)}
              className="border p-1 rounded"
            />
            <input
              type="number"
              placeholder="سعر الشراء"
              value={product.purchasePrice}
              onChange={(e) => updateProduct(index, "purchasePrice", parseFloat(e.target.value) || 0)}
              className="border p-1 rounded"
            />
            <input
              type="number"
              placeholder="الكمية"
              value={product.quantity}
              onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 0)}
              className="border p-1 rounded"
            />
            <button
              onClick={() => setProducts((prev) => prev.filter((_, i) => i !== index))}
              className="text-red-600 font-bold"
            >
              ❌
            </button>
          </div>
        ))}
        <button
          onClick={addEmptyProduct}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          ➕ إضافة منتج
        </button>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 mt-6 rounded hover:bg-blue-700"
      >
        💾 حفظ الفاتورة
      </button>
    </div>
  );
}
