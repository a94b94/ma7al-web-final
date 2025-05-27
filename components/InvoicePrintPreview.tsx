"use client";

import React from "react";

interface InvoiceProps {
  order: {
    _id: string;
    phone: string;
    address?: string;
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
}

export default function InvoicePrintPreview({ order, storeName }: InvoiceProps) {
  const invoiceNumber = order._id?.slice(-6) || "------";
  const createdAt = new Date(order.createdAt);
  const formattedDate = `${createdAt.getDate().toString().padStart(2, "0")}/${(createdAt.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${createdAt.getFullYear()}`;

  const paid = order.paid || 0;
  const discount = order.discount || 0;
  const totalAfterDiscount = order.total - discount;

  return (
    <div
      className="invoice-container"
      style={{ direction: "rtl", fontFamily: "Tahoma, sans-serif", fontSize: 14 }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{storeName}</h2>
        <p>رقم الفاتورة: #{invoiceNumber}</p>
        <p>تاريخ الفاتورة: {formattedDate}</p>
        <p>الاسم: {order.customerName || "—"}</p>
        <p>الهاتف: {order.phone}</p>
        {order.address && <p>العنوان: {order.address}</p>}
      </div>

      {/* Products Table */}
      <table
        className="invoice-table"
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}
      >
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
              <td style={cellStyle}>{item.price.toLocaleString("ar-IQ")} د.ع</td>
              <td style={cellStyle}>
                {(item.price * item.quantity).toLocaleString("ar-IQ")} د.ع
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ marginTop: 20, lineHeight: 1.8 }}>
        <p>💵 المبلغ المدفوع: {paid.toLocaleString("ar-IQ")} د.ع</p>
        <p>🔻 الخصم: {discount.toLocaleString("ar-IQ")} د.ع</p>
        <p style={{ fontWeight: "bold" }}>
          💰 المبلغ النهائي: {totalAfterDiscount.toLocaleString("ar-IQ")} د.ع
        </p>
      </div>

      {/* Installment Info */}
      {order.type === "installment" && (
        <div style={{ marginTop: 10 }}>
          <p>📄 <strong>تفاصيل الأقساط:</strong></p>
          <p>عدد الأقساط: {order.installmentsCount}</p>
          <p>الدفعة الأولى: {order.downPayment?.toLocaleString("ar-IQ")} د.ع</p>
          <p>المتبقي: {order.remaining?.toLocaleString("ar-IQ")} د.ع</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 30, borderTop: "1px dashed #000", paddingTop: 10 }}>
        <p>💡 الرجاء الاحتفاظ بالفاتورة كمرجع.</p>
      </div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "6px",
  textAlign: "center",
  whiteSpace: "nowrap",
};
