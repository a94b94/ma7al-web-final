import React, { useEffect, useState } from "react";
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
  const { id, print } = router.query;

  const [cart, setCart] = useState<CartItem[]>([{ name: "", quantity: 1, price: 0 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceType, setInvoiceType] = useState<"cash" | "installment">("cash");
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [storeName, setStoreName] = useState("Ma7al Store");
  const [storeLogo, setStoreLogo] = useState("/logo.png");
  const [showInvoice, setShowInvoice] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remaining = Math.max(total - downPayment, 0);

  const fakeOrder = {
    _id: typeof id === "string" ? id : undefined,
    phone: customerPhone || "غير مذكور",
    customerName: customerName || "زبون محلي",
    cart,
    total,
    createdAt: new Date().toISOString(),
    type: invoiceType,
    downPayment,
    installmentsCount,
    dueDate: dueDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    remaining,
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
      } else {
        toast.error("❌ فشل في حفظ الفاتورة");
      }
    } catch {
      toast.error("⚠️ حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📎 توليد فاتورة محلية</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">👤 اسم الزبون</label>
          <input className="border p-2 w-full rounded" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1">📞 رقم الهاتف</label>
          <input className="border p-2 w-full rounded" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black mb-1">نوع الفاتورة</label>
        <select className="border p-2 w-full rounded" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as any)}>
          <option value="cash">💵 نقد</option>
          <option value="installment">📄 أقساط</option>
        </select>
      </div>

      {invoiceType === "installment" && (
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">💰 دفعة أولى</label>
            <input type="number" className="border p-2 w-full rounded" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">📆 عدد الأقساط</label>
            <input type="number" className="border p-2 w-full rounded" value={installmentsCount} onChange={(e) => setInstallmentsCount(+e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">📅 تاريخ الاستحقاق</label>
            <input type="date" className="border p-2 w-full rounded" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      )}

      {cart.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-black mb-1">اسم المنتج</label>
            <input className="border p-2 w-full rounded" value={item.name} onChange={(e) => handleChange(idx, "name", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">الكمية</label>
            <input type="number" className="border p-2 w-20 rounded" value={item.quantity} onChange={(e) => handleChange(idx, "quantity", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">السعر</label>
            <input type="number" className="border p-2 w-32 rounded" value={item.price} onChange={(e) => handleChange(idx, "price", e.target.value)} />
          </div>
        </div>
      ))}

      <button onClick={handleAddRow} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">+ إضافة منتج</button>
      <button onClick={() => { setShowInvoice(true); handleSaveInvoice(); }} className="bg-green-600 text-white px-6 py-2 rounded w-full">✅ توليد الفاتورة</button>

      {showInvoice && (
        <div className="mt-10 border p-4 bg-white shadow">
          <InvoicePreview
            order={fakeOrder}
            storeName={storeName}
            storeLogo={storeLogo}
            showActions={true}
          />
        </div>
      )}
    </div>
  );
}
