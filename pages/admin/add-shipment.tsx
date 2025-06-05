"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function AddShipmentPage() {
  const [products, setProducts] = useState([
    { sku: "", name: "", quantity: 1, purchasePrice: 0 }
  ]);
  const [supplier, setSupplier] = useState("");
  const [shipmentNote, setShipmentNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddProduct = () => {
    setProducts([...products, { sku: "", name: "", quantity: 1, purchasePrice: 0 }]);
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const updated = [...products];
    (updated[index] as any)[field] = value;
    setProducts(updated);
  };

  const handleSubmit = async () => {
    // ✅ تحقق من صحة الإدخالات
    for (const product of products) {
      if (!product.sku || !product.name || product.quantity <= 0 || product.purchasePrice <= 0) {
        toast.error("❗️يرجى ملء جميع الحقول بشكل صحيح لكل منتج");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/shipments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier,
          note: shipmentNote,
          products,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ تم إضافة الشحنة وتحديث المخزون");
        setProducts([{ sku: "", name: "", quantity: 1, purchasePrice: 0 }]);
        setShipmentNote("");
        setSupplier("");
      } else {
        toast.error(data.error || "❌ حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("❌ فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4">➕ إضافة شحنة جديدة</h1>

        <input
          type="text"
          placeholder="اسم المورد (اختياري)"
          className="w-full border p-2 rounded"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
        />

        <textarea
          placeholder="ملاحظات إضافية (اختياري)"
          className="w-full border p-2 rounded"
          value={shipmentNote}
          onChange={(e) => setShipmentNote(e.target.value)}
        />

        {products.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border p-2 rounded bg-gray-50"
          >
            <input
              type="text"
              placeholder="📦 الباركود / SKU"
              className="border p-2 rounded"
              value={product.sku}
              onChange={(e) => handleChange(index, "sku", e.target.value)}
            />
            <input
              type="text"
              placeholder="📝 اسم المنتج"
              className="border p-2 rounded"
              value={product.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="📦 الكمية"
              className="border p-2 rounded"
              value={product.quantity}
              onChange={(e) => handleChange(index, "quantity", +e.target.value)}
              min={1}
            />
            <input
              type="number"
              placeholder="💰 سعر الشراء"
              className="border p-2 rounded"
              value={product.purchasePrice}
              onChange={(e) => handleChange(index, "purchasePrice", +e.target.value)}
              min={0}
            />
          </div>
        ))}

        <div className="flex flex-wrap gap-4 mt-4">
          <Button onClick={handleAddProduct}>➕ منتج آخر</Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "🔄 جاري الحفظ..." : "✅ حفظ الشحنة"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
