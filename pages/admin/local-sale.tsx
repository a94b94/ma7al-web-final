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
    installmentsCount: Number(installmentsCount),
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
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
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("❗ يرجى إدخال اسم الزبون ورقم الهاتف");
      return;
    }

    if (cart.length === 0 || cart.some(item => !item.name.trim() || item.quantity <= 0 || item.price <= 0)) {
      toast.error("❗ يرجى إدخال بيانات صحيحة لجميع المنتجات");
      return;
    }

    if (invoiceType === "installment") {
      if (!installmentsCount || installmentsCount <= 0 || !dueDate) {
        toast.error("❗ يرجى إدخال عدد الأقساط وتاريخ الاستحقاق قبل الحفظ");
        return;
      }
    }

    try {
      const res = await fetch("/api/local-sale/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fakeOrder),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("✅ تم حفظ الفاتورة بنجاح");

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

  const handlePrintPDF = async () => {
    const element = document.getElementById("invoice-preview");
    if (!element) return;
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .from(element)
      .set({ margin: 0.5, filename: `فاتورة-${customerName}.pdf`, html2canvas: { scale: 2 } })
      .save();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-center">📎 توليد فاتورة محلية</h1>
        <button onClick={() => router.push("/admin")} className="text-sm underline text-blue-600">← رجوع للوحة التحكم</button>
      </div>

      {/* باقي المحتوى بدون تغيير */}

      {showInvoice && (
        <div>
          <div className="flex justify-end mb-2">
            <button onClick={handlePrintPDF} className="bg-gray-800 text-white px-4 py-1 rounded">🖨️ طباعة PDF</button>
          </div>
          <div id="invoice-preview" className="border p-4 bg-white shadow">
            <InvoicePreview order={fakeOrder} storeName={storeName} showActions={true} />
          </div>
        </div>
      )}
    </div>
  );
}
