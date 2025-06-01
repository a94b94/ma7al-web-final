"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import axios from "axios";

const InvoicePreview = dynamic(() => import("@/components/InvoicePreview"), { ssr: false });
const InstallmentTable = dynamic(() => import("@/components/installments/InstallmentTable"), { ssr: false });

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
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const today = new Date().toLocaleDateString("ar-EG");

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
    setDueDate(new Date().toISOString().slice(0, 10));
    const randomId = Math.floor(100 + Math.random() * 900);
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    setInvoiceNumber(`INV-${dateCode}-${randomId}`);
  }, []);

  const addToCart = (product: Product) => {
    const exists = cart.find((item) => item.productId === product._id);
    if (exists) {
      toast.error("✅ المنتج موجود بالفعل في السلة");
      return;
    }
    setCart([...cart, { productId: product._id, name: product.name, quantity: 1, price: product.price }]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const autoInstallmentsCount = Math.max(1, Math.round((totalAmount - downPayment) / 100000));

  const handleSaveInvoice = async () => {
    try {
      const res = await axios.post("/api/local-sale/create", {
        customerName,
        phone: customerPhone,
        cart,
        total: totalAmount,
        type: invoiceType,
        downPayment,
        installmentsCount: invoiceType === "installment" ? autoInstallmentsCount : 0,
        dueDate,
        paid,
        discount,
        invoiceNumber,
      });
      toast.success("✅ تم حفظ الفاتورة بنجاح");
      router.push(`/admin/invoices/${res.data.invoice._id}`);
    } catch (err) {
      toast.error("فشل في حفظ الفاتورة");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">🧾 إنشاء فاتورة جديدة</h2>
      <p className="mb-2 text-sm text-gray-600">📅 التاريخ: {today}</p>
      <p className="mb-4 text-sm text-gray-600">رقم الفاتورة: <strong>{invoiceNumber}</strong></p>

      {/* نوع الفاتورة */}
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="invoiceType"
            value="cash"
            checked={invoiceType === "cash"}
            onChange={() => setInvoiceType("cash")}
            className="mr-1"
          />
          نقد
        </label>
        <label>
          <input
            type="radio"
            name="invoiceType"
            value="installment"
            checked={invoiceType === "installment"}
            onChange={() => setInvoiceType("installment")}
            className="mr-1"
          />
          تقسيط
        </label>
      </div>

      {/* بيانات الزبون */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">اسم الزبون</label>
          <input type="text" className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">رقم الهاتف</label>
          <input type="tel" className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
        {invoiceType === "installment" && (
          <>
            <div>
              <label className="block text-sm mb-1">الدفعة الأولى</label>
              <input type="number" className="input" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">عدد الأقساط (محسوب تلقائيًا)</label>
              <input type="number" className="input" value={autoInstallmentsCount} readOnly />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm mb-1">المدفوع</label>
          <input type="number" className="input" value={paid} onChange={(e) => setPaid(+e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">الخصم</label>
          <input type="number" className="input" value={discount} onChange={(e) => setDiscount(+e.target.value)} />
        </div>
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

      {/* ✅ عرض الفاتورة + الأقساط داخل تنسيق الطباعة */}
      <div className="invoice-container mt-8">
        <InvoicePreview
          order={{
            _id: invoiceNumber,
            phone: customerPhone,
            customerName,
            cart,
            total: totalAmount,
            createdAt: new Date().toISOString(),
            type: invoiceType,
            downPayment,
            installmentsCount: invoiceType === "installment" ? autoInstallmentsCount : 0,
            dueDate,
            remaining: invoiceType === "installment" ? totalAmount - downPayment : 0,
            paid,
            discount,
          }}
          storeName="Ma7al Store"
        />

        {invoiceType === "installment" && (
          <div className="mt-6">
            <InstallmentTable
              totalAmount={totalAmount}
              downPayment={downPayment}
              count={autoInstallmentsCount}
              startDate={dueDate}
              orderId={invoiceNumber}
              customerPhone={customerPhone}
            />
          </div>
        )}
      </div>

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
