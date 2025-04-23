import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const InvoicePreview = dynamic(() => import("@/components/InvoicePreview"), {
  ssr: false,
});

export default function LocalSalePage() {
  const router = useRouter();
  const { id, print } = router.query;

  const [cart, setCart] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceType, setInvoiceType] = useState<"cash" | "installment">("cash");
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [storeName, setStoreName] = useState("Ma7al Store");
  const [storeLogo, setStoreLogo] = useState("/logo.png");
  const [storeStamp, setStoreStamp] = useState("/stamp.png");
  const [showInvoice, setShowInvoice] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remaining = Math.max(total - downPayment, 0);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (id && typeof id === "string") {
        const res = await fetch(`/api/local-sale/get?id=${id}`);
        const data = await res.json();
        if (data.success) {
          const inv = data.invoice;
          setCustomerName(inv.address);
          setCustomerPhone(inv.phone);
          setCart(inv.cart);
          setInvoiceType(inv.type);
          setDownPayment(inv.downPayment || 0);
          setInstallmentsCount(inv.installmentsCount || 0);
          setDueDate(inv.dueDate?.substring(0, 10) || "");
          setShowInvoice(true);
        }
      }
    };

    fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (print === "true" && showInvoice) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [print, showInvoice]);

  const handleChange = (index: number, field: string, value: string | number) => {
    const updated = [...cart];
    // @ts-ignore
    updated[index][field] = field === "quantity" || field === "price" ? Number(value) : value;
    setCart(updated);
  };

  const handleAddRow = () => {
    setCart([...cart, { name: "", quantity: 1, price: 0 }]);
  };

  const fakeOrder = {
    phone: customerPhone || "غير مذكور",
    address: customerName || "زبون محلي",
    cart,
    total,
    createdAt: new Date().toISOString(),
    type: invoiceType,
    downPayment,
    installmentsCount,
    dueDate: dueDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    remaining,
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
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ الفاتورة");
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: "فاتورة.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const handleSendWhatsApp = async () => {
    try {
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: customerPhone,
          message: `👋 مرحبًا ${customerName || "عميلنا"}، هذه نسخة من فاتورتك:\n\n📦 المنتجات:\n${cart
            .map((item) => `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} د.ع`)
            .join("\n")}\n\n💰 الإجمالي: ${total.toLocaleString("ar-IQ")} د.ع\n\nشكراً لك\n${storeName}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم إرسال الفاتورة عبر واتساب");
      } else {
        toast.error("❌ فشل في إرسال الرسالة");
      }
    } catch (error) {
      toast.error("⚠️ حدث خطأ أثناء الإرسال");
    }
  };

  const showActions = print !== "true";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📎 توليد فاتورة محلية</h1>

      {showActions && (
        <>
          {/* بيانات الزبون */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input className="border p-2" placeholder="👤 اسم الزبون" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className="border p-2" placeholder="📞 رقم الهاتف" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>

          {/* نوع الفاتورة */}
          <div className="mb-4">
            <select className="border p-2 w-full" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as "cash" | "installment")}>
              <option value="cash">💵 نقد</option>
              <option value="installment">📄 أقساط</option>
            </select>
          </div>

          {invoiceType === "installment" && (
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <input type="number" className="border p-2" placeholder="💰 دفعة أولى" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} />
              <input type="number" className="border p-2" placeholder="📆 عدد الأقساط" value={installmentsCount} onChange={(e) => setInstallmentsCount(+e.target.value)} />
              <input type="date" className="border p-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          )}

          {/* تفاصيل المنتجات */}
          {cart.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="border p-2 flex-1" placeholder="اسم المنتج" value={item.name} onChange={(e) => handleChange(idx, "name", e.target.value)} />
              <input type="number" className="border p-2 w-20" placeholder="الكمية" value={item.quantity} onChange={(e) => handleChange(idx, "quantity", e.target.value)} />
              <input type="number" className="border p-2 w-32" placeholder="السعر" value={item.price} onChange={(e) => handleChange(idx, "price", e.target.value)} />
            </div>
          ))}

          <button onClick={handleAddRow} className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
            + إضافة منتج
          </button>

          <button onClick={() => { setShowInvoice(true); handleSaveInvoice(); }} className="bg-green-600 text-white px-6 py-2 rounded w-full">
            ✅ توليد الفاتورة
          </button>
        </>
      )}

      {/* عرض الفاتورة */}
      {showInvoice && (
        <>
          <div id="invoice-print-area" className="mt-10 border p-4 bg-white shadow">
            <InvoicePreview order={fakeOrder} storeName={storeName} storeLogo={storeLogo} storeStamp={storeStamp} showActions={showActions} />
          </div>

          {showActions && (
            <div className="text-center mt-4 flex flex-col gap-3 items-center">
              <button onClick={handlePrint} className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 w-full">🖨️ طباعة الفاتورة</button>
              <button onClick={handleSendWhatsApp} className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 w-full">📤 إرسال الفاتورة عبر واتساب</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
