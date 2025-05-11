"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const InvoicePreview = dynamic(() => import("@/components/InvoicePreview"), { ssr: false });

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export default function LocalSalePage() {
  const router = useRouter();
  const { id } = router.query;

  const [cart, setCart] = useState<CartItem[]>([{ name: "", quantity: 1, price: 0 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceType, setInvoiceType] = useState<"cash" | "installment">("cash");
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [paid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [storeName, setStoreName] = useState("Ma7al Store");
  const [storeLogo] = useState("/logo.png");
  const [showInvoice, setShowInvoice] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAfterDiscount = Math.max(total - discount, 0);
  const remaining = Math.max(totalAfterDiscount - paid, 0);
  const monthlyInstallment = invoiceType === "installment" && installmentsCount > 0
    ? Math.ceil((totalAfterDiscount - downPayment) / installmentsCount)
    : 0;

  const fakeOrder = {
    _id: typeof id === "string" ? id : undefined,
    phone: customerPhone || "غير مذكور",
    address: customerName || "زبون محلي",
    cart,
    total: totalAfterDiscount,
    createdAt: new Date().toISOString(),
    type: invoiceType,
    downPayment,
    installmentsCount,
    dueDate: dueDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    remaining,
    paid,
    discount,
    monthlyInstallment,
  };

  const handleChange = (index: number, field: keyof CartItem, value: string | number) => {
    const updated = [...cart];
    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" || field === "price" ? Number(value) : String(value),
    };
    setCart(updated);
  };

  const handleAddRow = () => {
    setCart([...cart, { name: "", quantity: 1, price: 0 }]);
  };

  const handleSaveInvoice = async () => {
    try {
      const res = await fetch("/api/local-sale/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fakeOrder),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("✅ تم حفظ الفاتورة بنجاح");

        // إرسال رسالة واتساب تلقائيًا
        await fetch("https://ma7al-whatsapp-production.up.railway.app/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: customerPhone.replace("+", ""),
            message: `تم تسجيل فاتورة جديدة للزبون ${customerName}\nالمبلغ الكلي: ${totalAfterDiscount} د.ع\nالمتبقي: ${remaining} د.ع\n${invoiceType === "installment" ? `القسط الشهري: ${monthlyInstallment} د.ع` : "تم الدفع بالكامل"}\nشكراً لتعاملكم معنا!`,
          }),
        });

        toast.success("📤 تم إرسال الفاتورة عبر WhatsApp");
      } else {
        toast.error("❌ فشل في حفظ الفاتورة");
      }
    } catch (err) {
      toast.error("⚠️ حدث خطأ أثناء الحفظ أو الإرسال");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📎 توليد فاتورة محلية</h1>

      {/* معلومات الزبون */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">👤 اسم الزبون</label>
          <input className="border p-2 w-full rounded" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">📞 رقم الهاتف</label>
          <input className="border p-2 w-full rounded" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
      </div>

      {/* المبالغ */}
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">💵 المبلغ المدفوع</label>
          <input type="number" className="border p-2 w-full rounded" value={paid} onChange={(e) => setPaid(+e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">🔻 الخصم</label>
          <input type="number" className="border p-2 w-full rounded" value={discount} onChange={(e) => setDiscount(+e.target.value)} />
        </div>
        <div>
          <label className="block mb-1 font-medium">💰 المتبقي</label>
          <input type="number" className="border p-2 w-full rounded" value={remaining} readOnly />
        </div>
      </div>

      {/* نوع الفاتورة */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">نوع الفاتورة</label>
        <select className="border p-2 w-full rounded" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as any)}>
          <option value="cash">💵 نقد</option>
          <option value="installment">📄 أقساط</option>
        </select>
      </div>

      {invoiceType === "installment" && (
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">💰 دفعة أولى</label>
            <input type="number" className="border p-2 w-full rounded" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">📆 عدد الأقساط</label>
            <input type="number" className="border p-2 w-full rounded" value={installmentsCount} onChange={(e) => setInstallmentsCount(+e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">📅 تاريخ الاستحقاق</label>
            <input type="date" className="border p-2 w-full rounded" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      )}

      {/* تفاصيل المنتجات */}
      {cart.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input className="border p-2 flex-1 rounded" placeholder="اسم المنتج" value={item.name} onChange={(e) => handleChange(idx, "name", e.target.value)} />
          <input type="number" className="border p-2 w-20 rounded" placeholder="الكمية" value={item.quantity} onChange={(e) => handleChange(idx, "quantity", e.target.value)} />
          <input type="number" className="border p-2 w-32 rounded" placeholder="السعر" value={item.price} onChange={(e) => handleChange(idx, "price", e.target.value)} />
        </div>
      ))}

      <button onClick={handleAddRow} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">+ إضافة منتج</button>
      <button onClick={() => { setShowInvoice(true); handleSaveInvoice(); }} className="bg-green-600 text-white px-6 py-2 rounded w-full">✅ توليد الفاتورة</button>

      {/* عرض الفاتورة */}
      {showInvoice && (
        <div className="mt-10 border p-4 bg-white shadow">
          <InvoicePreview order={fakeOrder} storeName={storeName} showActions={true} />
        </div>
      )}
    </div>
  );
}
