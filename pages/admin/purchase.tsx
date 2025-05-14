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

export default function PurchasePage() {
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [products, setProducts] = useState<ProductInput[]>([
    { name: "", barcode: "", category: "", purchasePrice: 0, quantity: 1 },
  ]);

  // ✅ الدالة المعدلة لتجنب Type Error
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
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const handleSubmit = async () => {
    if (!supplierName || !invoiceNumber || products.length === 0) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const res = await axios.post("/api/purchase", {
        supplierName,
        invoiceNumber,
        products,
      });
      if (res.data.success) {
        toast.success("✅ تم تسجيل الفاتورة وإدخال المنتجات إلى المخزن");
        setProducts([{ name: "", barcode: "", category: "", purchasePrice: 0, quantity: 1 }]);
        setSupplierName("");
        setInvoiceNumber("");
      }
    } catch (err) {
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
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الباركود</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">سعر الشراء</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">❌</th>
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
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    value={product.category}
                    onChange={(e) => handleChange(index, "category", e.target.value)}
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={product.purchasePrice}
                    onChange={(e) =>
                      handleChange(index, "purchasePrice", parseFloat(e.target.value))
                    }
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    className="w-full p-1 border rounded"
                    value={product.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", parseInt(e.target.value))
                    }
                  />
                </td>
                <td className="text-center">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeProductRow(index)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex gap-4">
          <button
            onClick={addProductRow}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            ➕ إضافة منتج آخر
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            💾 تسجيل الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
}
