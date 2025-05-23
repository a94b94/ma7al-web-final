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
};

export default function InvoicePreview({ order, storeName }: InvoicePreviewProps) {
  const invoiceNumber = order._id?.slice(-6) || "------";
  const formattedDate = new Date(order.createdAt).toLocaleDateString("ar-EG");
  const paid = order.paid || 0;
  const discount = order.discount || 0;
  const totalAfterDiscount = order.total - discount;

  return (
    <div className="invoice-container" style={{ fontFamily: "Tahoma", direction: "rtl", padding: 20 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>{storeName}</h2>
        <p>رقم الفاتورة: #{invoiceNumber}</p>
        <p>التاريخ: {formattedDate}</p>
        <p>اسم الزبون: {order.customerName || "—"}</p>
        <p>الهاتف: {order.phone}</p>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 20 }}>
        <thead>
          <tr>
            <th style={cellStyle}>#</th>
            <th style={cellStyle}>المنتج</th>
            <th style={cellStyle}>الكمية</th>
            <th style={cellStyle}>السعر</th>
            <th style={cellStyle}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {order.cart.map((item, i) => (
            <tr key={i}>
              <td style={cellStyle}>{i + 1}</td>
              <td style={cellStyle}>{item.name}</td>
              <td style={cellStyle}>{item.quantity}</td>
              <td style={cellStyle}>{item.price.toLocaleString("en-US")} د.ع</td>
              <td style={cellStyle}>{(item.price * item.quantity).toLocaleString("en-US")} د.ع</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div>
        <p>💵 المدفوع: {paid.toLocaleString("en-US")} د.ع</p>
        <p>🔻 الخصم: {discount.toLocaleString("en-US")} د.ع</p>
        <p><strong>💰 بعد الخصم: {totalAfterDiscount.toLocaleString("en-US")} د.ع</strong></p>
      </div>

      {/* Installment */}
      {order.type === "installment" && (
        <div style={{ marginTop: 20 }}>
          <p>📄 تفاصيل التقسيط:</p>
          <p>عدد الأقساط: {order.installmentsCount}</p>
          <p>الدفعة الأولى: {order.downPayment?.toLocaleString("en-US")} د.ع</p>
          <p>المتبقي: {order.remaining?.toLocaleString("en-US")} د.ع</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 30, borderTop: "1px dashed #000", paddingTop: 10 }}>
        <p>💡 ملاحظة: يُرجى الاحتفاظ بالفاتورة كمرجع.</p>
      </div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "6px",
  textAlign: "center",
};
