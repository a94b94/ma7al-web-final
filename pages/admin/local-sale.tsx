"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import axios from "axios";

const InvoicePreview = dynamic(() => import("@/components/InvoicePreview"), { ssr: false });

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function LocalSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceType, setInvoiceType] = useState<"cash" | "installment">("cash");
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [paid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  const addToCart = (product: Product) => {
    const exists = cart.find((item) => item.productId === product._id);
    if (exists) {
      toast.error("✅ المنتج موجود بالفعل في السلة");
      return;
    }
    setCart([...cart, { productId: product._id, name: product.name, quantity: 1, price: product.price }]);
  };

  const handleSaveInvoice = async () => {
    try {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await axios.post("/api/local-sale/create", {
        customerName,
        phone: customerPhone,
        cart,
        total,
        type: invoiceType,
        downPayment,
        installmentsCount,
        dueDate,
        paid,
        discount,
      });
      toast.success("✅ تم حفظ الفاتورة بنجاح");
      router.push(`/admin/invoices/${res.data.invoice._id}`);
    } catch (err) {
      toast.error("فشل في حفظ الفاتورة");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">🧾 إنشاء فاتورة جديدة</h2>

      {/* اختيار الزبون */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input type="text" placeholder="اسم الزبون" className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input type="tel" placeholder="رقم الهاتف" className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        <input type="number" placeholder="الدفعة الأولى" className="input" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} />
        <input type="number" placeholder="عدد الأقساط" className="input" value={installmentsCount} onChange={(e) => setInstallmentsCount(+e.target.value)} />
        <input type="date" placeholder="تاريخ أول قسط" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <input type="number" placeholder="المدفوع" className="input" value={paid} onChange={(e) => setPaid(+e.target.value)} />
        <input type="number" placeholder="الخصم" className="input" value={discount} onChange={(e) => setDiscount(+e.target.value)} />
      </div>

      {/* اختيار المنتجات من المخزون */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">📦 المنتجات المتاحة:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {products.map((product) => (
            <button
              key={product._id}
              className="border rounded p-2 hover:bg-blue-100"
              onClick={() => addToCart(product)}
            >
              {product.name} ({product.price.toLocaleString()} د.ع)
            </button>
          ))}
        </div>
      </div>

      {/* عرض الفاتورة */}
      <InvoicePreview
        order={{
          _id: "temp-id",
          phone: customerPhone,
          customerName,
          cart,
          total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          createdAt: new Date().toISOString(),
          type: invoiceType,
          downPayment,
          installmentsCount,
          dueDate,
          remaining: 0,
          paid,
          discount,
        }}
        storeName="Ma7al Store"
      />

      {/* الأزرار */}
      <div className="flex gap-4 mt-4">
        <button onClick={handleSaveInvoice} className="bg-green-600 text-white px-6 py-2 rounded">
          💾 حفظ الفاتورة
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded">
          🖨️ طباعة
        </button>
      </div>
    </div>
  );
}
