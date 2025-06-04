"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

interface ProductInput {
  name: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  quantity: number;
}

const categories = ["موبايلات", "لابتوبات", "سماعات", "ساعات", "أجهزة كهربائية", "أخرى"];

export default function PurchasePage() {
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [products, setProducts] = useState<ProductInput[]>([
    { name: "", barcode: "", category: "", purchasePrice: 0, quantity: 1 },
  ]);

  const handleChange = <K extends keyof ProductInput>(
    index: number,
    field: K,
    value: ProductInput[K]
  ) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProductRow = () => {
    setProducts([
      ...products,
      { name: "", barcode: "", category: "", purchasePrice: 0, quantity: 1 },
    ]);
  };

  const removeProductRow = (index: number) => {
    if (products.length === 1) return toast.error("لا يمكن حذف آخر منتج");
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const total = products.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);

  const handleSubmit = async () => {
    if (!supplierName || !invoiceNumber || products.length === 0) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const hasInvalid = products.some(
      (p) => !p.name || p.purchasePrice <= 0 || p.quantity <= 0
    );
    if (hasInvalid) {
      toast.error("يرجى التحقق من صحة بيانات المنتجات");
      return;
    }

    try {
      const res = await axios.post("/api/purchase", {
        supplierName,
        invoiceNumber,
        products,
      });
      if (res.data.success) {
        toast.success("✅ تم تسجيل الفاتورة بنجاح");
        setProducts([{ name: "", barcode: "", category: "", purchasePrice: 0, quantity: 1 }]);
        setSupplierName("");
        setInvoiceNumber("");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">🧾 إنشاء فاتورة شراء</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="اسم المورد"
          className="p-2 border rounded"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
        />
        <input
          type="text"
          placeholder="رقم الفاتورة"
          className="p-2 border rounded"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الباركود</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">سعر الشراء</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">إزالة</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td className="p-1 border">
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    value={product.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    value={product.barcode}
                    onChange={(e) => handleChange(index, "barcode", e.target.value)}
                  />
                </td>
                <td className="p-1 border">
                  <select
                    className="w-full p-1 border rounded"
                    value={product.category}
                    onChange={(e) => handleChange(index, "category", e.target.value)}
                  >
                    <option value="">اختر قسم</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min={0}
                    className="w-full p-1 border rounded"
                    value={product.purchasePrice}
                    onChange={(e) =>
                      handleChange(index, "purchasePrice", parseFloat(e.target.value) || 0)
                    }
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min={1}
                    className="w-full p-1 border rounded"
                    value={product.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", parseInt(e.target.value) || 1)
                    }
                  />
                </td>
                <td className="text-center">
                  <button
                    onClick={() => removeProductRow(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <button
            onClick={addProductRow}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            ➕ إضافة منتج
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            💾 تسجيل الفاتورة
          </button>

          <span className="ml-auto font-bold text-green-700">
            💰 المجموع: {total.toLocaleString()} د.ع
          </span>
        </div>
      </div>
    </div>
  );
}
