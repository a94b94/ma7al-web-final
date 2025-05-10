import React from "react";

type InvoicePreviewProps = {
  order: {
    _id: string;
    phone: string;
    customerName?: string;
    cart: { name: string; quantity: number; price: number }[];
    total: number;
    createdAt: string;
    type: "cash" | "installment";
    downPayment?: number;
    installmentsCount?: number;
    dueDate?: string;
    remaining?: number;
    paid?: number;
    discount?: number;
  };
  storeName: string;
  showActions?: boolean;
};

export default function InvoicePreview({
  order,
  storeName,
  showActions = true,
}: InvoicePreviewProps) {
  const invoiceTypeLabel =
    order.type === "installment" ? "فاتورة بيع أقساط" : "فاتورة بيع نقد";
  const typeColor = order.type === "installment" ? "#d97706" : "#10b981";

  const handlePrint = () => window.print();

  const sendToWhatsAppServer = async () => {
    const date = new Date(order.createdAt).toLocaleDateString("ar-EG");
    const productList = order.cart
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.name} - الكمية: ${item.quantity} - السعر: ${item.price.toLocaleString("ar-EG")} د.ع`
      )
      .join("\n");

    const message = `🧾 *${invoiceTypeLabel}*
📅 التاريخ: ${date}
👤 الاسم: ${order.customerName || "-"}
📞 الهاتف: ${order.phone}

📦 المنتجات:
${productList}

💰 الإجمالي: ${order.total.toLocaleString("ar-EG")} د.ع

🔻 مرسل من: ${storeName}`;

    try {
      const res = await fetch("https://ma7al-whatsapp-production.up.railway.app/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: order.phone.replace(/^0/, "964"),
          message,
        }),
      });

      if (res.ok) {
        alert("✅ تم إرسال الفاتورة إلى الزبون عبر واتساب");
      } else {
        alert("❌ فشل في إرسال الفاتورة");
      }
    } catch (err) {
      alert("⚠️ حدث خطأ أثناء الاتصال بسيرفر الواتساب");
    }
  };

  const now = new Date();
  const formattedTime = now.toLocaleTimeString("ar-EG");
  const formattedDate = now.toLocaleDateString("ar-EG");
  const invoiceNumber =
    order._id?.slice(-6) || Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  const paid = order.paid || 0;
  const discount = order.discount || 0;
  const totalAfterDiscount = order.total - discount;

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#fff",
        color: "#000",
        fontSize: "16px",
        boxSizing: "border-box",
        border: "1px solid #000",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{storeName}</h2>
        <h3 style={{ fontSize: 20, marginTop: 4, color: typeColor }}>🧾 {invoiceTypeLabel}</h3>
        <p style={{ fontSize: 14, marginTop: 4 }}>🧾 رقم الفاتورة: {invoiceNumber}</p>
        <p style={{ fontSize: 14 }}>⏱️ الساعة: {formattedTime}</p>
      </div>

      <table
        style={{
          width: "100%",
          border: "1px solid #000",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr>
            <th style={cellStyle}>#</th>
            <th style={cellStyle}>اسم المنتج</th>
            <th style={cellStyle}>الكمية</th>
            <th style={cellStyle}>السعر</th>
            <th style={cellStyle}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {order.cart.map((item, index) => (
            <tr key={index}>
              <td style={cellStyle}>{index + 1}</td>
              <td style={cellStyle}>{item.name}</td>
              <td style={cellStyle}>{item.quantity}</td>
              <td style={cellStyle}>{item.price.toLocaleString("ar-EG")} د.ع</td>
              <td style={cellStyle}>
                {(item.price * item.quantity).toLocaleString("ar-EG")} د.ع
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: "left", marginTop: 20 }}>
        <p>
          <strong>📅 التاريخ:</strong> {formattedDate} &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>👤 اسم الزبون:</strong> {order.customerName || "—"} &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>📞 الهاتف:</strong> {order.phone}
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <p>
          <strong>💵 المبلغ المدفوع:</strong> {paid.toLocaleString("ar-EG")} د.ع
        </p>
        <p>
          <strong>🔻 الخصم:</strong> {discount.toLocaleString("ar-EG")} د.ع
        </p>
        <p style={{ fontSize: 16, fontWeight: "bold" }}>
          💰 الإجمالي بعد الخصم: {totalAfterDiscount.toLocaleString("ar-EG")} د.ع
        </p>
      </div>

      {order.type === "installment" && (
        <div style={{ marginTop: 20 }}>
          <p><strong>📥 تفاصيل الأقساط:</strong></p>
          <p>🔢 عدد الأقساط: {order.installmentsCount || "—"}</p>
          <p>💳 المبلغ المدفوع مقدماً: {order.downPayment?.toLocaleString("ar-EG") || 0} د.ع</p>
          <p>🧾 المتبقي: {order.remaining?.toLocaleString("ar-EG") || 0} د.ع</p>
          <p>🗓️ تاريخ أول قسط: {order.dueDate ? new Date(order.dueDate).toLocaleDateString("ar-EG") : "—"}</p>
        </div>
      )}

      {showActions && (
        <div
          style={{
            marginTop: 30,
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: "#1f2937",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            🖨️ طباعة الفاتورة
          </button>

          <button
            onClick={sendToWhatsAppServer}
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            📤 إرسال على WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "center",
};
