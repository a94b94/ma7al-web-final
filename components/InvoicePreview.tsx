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

  return (
    <div
      style={{
        padding: "20px",
        direction: "rtl",
        fontFamily: "'Cairo', sans-serif",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#fff",
        color: "#000",
        fontSize: "16px",
        boxSizing: "border-box",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      {/* رأس الفاتورة */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{storeName}</h2>
        <h3 style={{ fontSize: 18, marginTop: 6, color: typeColor }}>🧾 {invoiceTypeLabel}</h3>
      </div>

      {/* معلومات العميل والفاتورة */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: 20 }}>
        <Field label="📅 التاريخ" value={new Date(order.createdAt).toLocaleDateString("ar-EG")} />
        <Field label="👤 اسم الزبون" value={order.customerName || "—"} />
        <Field label="📞 الهاتف" value={order.phone} />
        {order.type === "installment" && (
          <>
            <Field label="💰 دفعة أولى" value={`${order.downPayment?.toLocaleString("ar-EG") || 0} د.ع`} />
            <Field label="📆 عدد الأقساط" value={order.installmentsCount?.toString() || "-"} />
            <Field
              label="📅 تاريخ الاستحقاق"
              value={order.dueDate ? new Date(order.dueDate).toLocaleDateString("ar-EG") : "—"}
            />
            <Field label="💳 المتبقي" value={`${order.remaining?.toLocaleString("ar-EG") || 0} د.ع`} />
          </>
        )}
      </div>

      {/* جدول المنتجات */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={cellStyle}>المنتج</th>
              <th style={cellStyle}>الكمية</th>
              <th style={cellStyle}>السعر</th>
              <th style={cellStyle}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.cart.map((item, idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{item.name}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>{item.quantity}</td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {item.price.toLocaleString("ar-EG")} د.ع
                </td>
                <td style={{ ...cellStyle, textAlign: "center" }}>
                  {(item.price * item.quantity).toLocaleString("ar-EG")} د.ع
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* الإجمالي */}
      <div style={{ textAlign: "left", marginTop: 30 }}>
        <h3 style={{ color: "#16a34a", fontSize: 18 }}>
          💰 الإجمالي: {order.total.toLocaleString("ar-EG")} دينار
        </h3>
      </div>

      {/* الأزرار */}
      {showActions && (
        <div style={{ marginTop: 30, display: "flex", justifyContent: "center", gap: "20px" }}>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: "1 1 200px", display: "flex", gap: "8px" }}>
      <strong>{label}:</strong>
      <span>{value || "—"}</span>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center",
  whiteSpace: "nowrap",
};
