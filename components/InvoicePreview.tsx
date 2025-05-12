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

export default function InvoicePrintPreview({ order, storeName }: InvoicePreviewProps) {
  const now = new Date(order.createdAt);
  const formattedDate = now.toLocaleDateString("ar-EG");
  const formattedTime = now.toLocaleTimeString("ar-EG");
  const invoiceNumber = order._id?.slice(-6).padStart(6, "0");

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20, fontFamily: 'Segoe UI, Tahoma', color: '#000' }}>
      {/* الترويسة */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: 10, marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>{storeName}</h2>
        <h3 style={{ margin: '5px 0' }}>{order.type === 'installment' ? 'فاتورة بيع أقساط' : 'فاتورة بيع نقد'}</h3>
        <p style={{ margin: 0 }}>رقم الفاتورة: {invoiceNumber}</p>
        <p style={{ margin: 0 }}>🕒 الساعة: {formattedTime} | 📅 التاريخ: {formattedDate}</p>
      </div>

      {/* جدول المنتجات */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>اسم المنتج</th>
            <th style={th}>الكمية</th>
            <th style={th}>السعر</th>
            <th style={th}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {order.cart.map((item, index) => (
            <tr key={index}>
              <td style={td}>{index + 1}</td>
              <td style={td}>{item.name}</td>
              <td style={td}>{item.quantity}</td>
              <td style={td}>{item.price.toLocaleString("en-US")} د.ع</td>
              <td style={td}>{(item.price * item.quantity).toLocaleString("en-US")} د.ع</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* تفاصيل الزبون */}
      <p><strong>👤 اسم الزبون:</strong> {order.customerName || "—"} | <strong>📞 الهاتف:</strong> {order.phone}</p>

      {/* المبالغ */}
      <p><strong>💵 المدفوع:</strong> {order.paid?.toLocaleString("en-US") || 0} د.ع</p>
      <p><strong>🔻 الخصم:</strong> {order.discount?.toLocaleString("en-US") || 0} د.ع</p>
      <p><strong>💰 الإجمالي بعد الخصم:</strong> {(order.total - (order.discount || 0)).toLocaleString("en-US")} د.ع</p>

      {/* تفاصيل الأقساط */}
      {order.type === "installment" && (
        <div style={{ marginTop: 20 }}>
          <p><strong>📥 تفاصيل الأقساط:</strong></p>
          <p>📆 عدد الأقساط: {order.installmentsCount}</p>
          <p>💳 الدفعة الأولى: {order.downPayment?.toLocaleString("en-US") || 0} د.ع</p>
          <p>💸 المتبقي: {order.remaining?.toLocaleString("en-US") || 0} د.ع</p>
          <p>🗓️ تاريخ أول قسط: {order.dueDate ? new Date(order.dueDate).toLocaleDateString("ar-EG") : '—'}</p>
        </div>
      )}

      {/* ملاحظات */}
      <div style={{ borderTop: '1px dashed #000', marginTop: 30, paddingTop: 10, fontSize: 13 }}>
        <p>📌 ملاحظة: يرجى الاحتفاظ بهذه الفاتورة كمرجع للدفعات اللاحقة.</p>
        <p>للاستفسار، الرجاء التواصل على الرقم الموجود أعلاه.</p>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  border: '1px solid #000',
  padding: 8,
  fontSize: 14,
  background: '#eee',
};

const td: React.CSSProperties = {
  border: '1px solid #000',
  padding: 8,
  fontSize: 14,
  textAlign: 'center',
};
