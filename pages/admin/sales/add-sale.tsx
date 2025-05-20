// pages/admin/sales/add-sale.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  stock: number;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

export default function AddSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"cash" | "installment">("cash");
  const [items, setItems] = useState<SaleItem[]>([{ productId: "", quantity: 1, price: 0 }]);
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(0);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    axios.get("/api/customers").then((res) => setCustomers(res.data));
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const handleItemChange = (
    index: number,
    field: keyof SaleItem,
    value: string | number
  ) => {
    const updatedItems = [...items];
    if (field === "quantity" || field === "price") {
      updatedItems[index][field] = Number(value) as never;
    } else {
      updatedItems[index][field] = value as never;
    }
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/sales/add", {
        customerId: selectedCustomer,
        paymentType,
        items,
        downPayment,
        installmentsCount,
        dueDate,
      });
      toast.success("تم حفظ الفاتورة بنجاح");
      router.push("/admin/sales");
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ الفاتورة");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">🧾 إضافة فاتورة بيع</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label>الزبون:</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">اختر زبون</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} - {c.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>نوع الدفع:</label>
          <select
            className="w-full border p-2 rounded"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as "cash" | "installment")}
          >
            <option value="cash">نقدي</option>
            <option value="installment">تقسيط</option>
          </select>
        </div>
      </div>

      {items.map((item, index) => (
        <div key={index} className="grid md:grid-cols-3 gap-2 items-center">
          <select
            className="w-full border p-2 rounded"
            value={item.productId}
            onChange={(e) => handleItemChange(index, "productId", e.target.value)}
          >
            <option value="">اختر منتج</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (مخزون: {p.stock})
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            className="w-full border p-2 rounded"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
            placeholder="الكمية"
          />

          <input
            type="number"
            className="w-full border p-2 rounded"
            value={item.price}
            onChange={(e) => handleItemChange(index, "price", e.target.value)}
            placeholder="السعر"
          />
        </div>
      ))}

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddItem}>
        ➕ إضافة منتج آخر
      </button>

      {paymentType === "installment" && (
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            placeholder="الدفعة الأولى"
          />
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={installmentsCount}
            onChange={(e) => setInstallmentsCount(Number(e.target.value))}
            placeholder="عدد الأقساط"
          />
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button className="bg-green-600 text-white px-6 py-2 rounded" onClick={handleSubmit}>
          💾 حفظ الفاتورة
        </button>
      </div>
    </div>
  );
}
