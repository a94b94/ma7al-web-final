import React from "react";

type InvoicePreviewProps = {
  order: {
    _id: string;
    phone: string;
    address: string;
    cart: { name: string; quantity: number; price: number }[];
    total: number;
    createdAt: string;
    type: "cash" | "installment";
    downPayment?: number;
    installmentsCount?: number;
    dueDate?: string;
    remaining?: number;
  };
  storeName: string; // ✅ تم إضافته
  storeLogo?: string;
  storeStamp?: string;
  showActions?: boolean;
};

export default function InvoicePreview({
  order,
  storeName,
  storeLogo,
  storeStamp,
  showActions,
}: InvoicePreviewProps) {
  const invoiceTypeLabel =
    order.type === "installment" ? "🧾 فاتورة بيع أقساط" : "🧾 فاتورة بيع نقد";
  const typeColor = order.type === "installment" ? "#d97706" : "#10b981";

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
        {storeLogo && (
          <img
            src={storeLogo}
            alt="شعار المتجر"
            style={{ maxWidth: "100px", marginBottom: 10 }}
          />
        )}
        <h2 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{storeName}</h2>
        <h3 style={{ fontSize: 18, marginTop: 6, color: typeColor }}>{invoiceTypeLabel}</h3>
      </div>

      {/* معلومات العميل والفاتورة */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: 20 }}>
        <Field label="📅 التاريخ" value={new Date(order.createdAt).toLocaleDateString("ar-EG")} />
        <Field label="📞 الهاتف" value={order.phone} />
        <Field label="📍 العنوان" value={order.address} />
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

      {/* الختم */}
      {storeStamp && (
        <div style={{ textAlign: "left", marginTop: 30 }}>
          <img
            src={storeStamp}
            alt="ختم المتجر"
            style={{ maxWidth: "100px", opacity: 0.8 }}
          />
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
