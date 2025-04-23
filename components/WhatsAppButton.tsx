
import React from "react";

type WhatsAppButtonProps = {
  customerName: string;
  customerPhone: string;
  orderTotal: number;
  dueDate?: string;
  products: { name: string; quantity: number; price: number }[];
  storeName: string;
  orderId: string;
};

export default function WhatsAppButton({
  customerName,
  customerPhone,
  orderTotal,
  dueDate,
  products,
  storeName,
  orderId,
}: WhatsAppButtonProps) {
  const formatMessage = () => {
    const productLines = products
      .map((p) => `- ${p.name} ${p.quantity} × ${p.price.toLocaleString()} د.ع`)
      .join("\n");

    return encodeURIComponent(
      `مرحبًا ${customerName || "العميل"} 👋\n` +
      `هذه فاتورتك من ${storeName} 💼\n\n` +
      `🧾 رقم الطلب: ${orderId}\n` +
      `📦 المنتجات:\n${productLines}\n\n` +
      `💰 المبلغ الكلي: ${orderTotal.toLocaleString()} د.ع\n` +
      (dueDate ? `📆 تاريخ الاستحقاق: ${dueDate}\n` : "") +
      `\nرابط المتجر: https://ma7al-store.com`
    );
  };

  const openWhatsApp = () => {
    const msg = formatMessage();
    const phone = customerPhone.replace(/[^\d]/g, "");
    const link = `https://wa.me/${phone}?text=${msg}`;
    window.open(link, "_blank");
  };

  return (
    <button
      onClick={openWhatsApp}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow mt-2"
    >
      📲 إرسال عبر واتساب Web
    </button>
  );
}
