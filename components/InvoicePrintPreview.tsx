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
  const formattedDate = createdAt.toLocaleDateString("ar-IQ");

  const paid = order.paid || 0;
  const discount = order.discount || 0;
  const totalAfterDiscount = Math.max(0, order.total - discount);

  const totalQty = order.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="invoice-container"
      style={{ direction: "rtl", fontFamily: "Tahoma, sans-serif", fontSize: 14, padding: 16 }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>{storeName}</h2>
        <p>رقم الفاتورة: #{invoiceNumber}</p>
        <p>تاريخ الفاتورة: {formattedDate}</p>
        <p>اسم الزبون: {order.customerName || "—"}</p>
        <p>رقم الهاتف: {order.phone}</p>
        {order.address && <p>📍 العنوان: {order.address}</p>}
      </div>

      {/* Products Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
          marginBottom: 10,
        }}
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
          {order.cart.map((item, index) => (
            <tr key={index}>
              <td style={cellStyle}>{index + 1}</td>
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
      <div style={{ marginTop: 10, lineHeight: 1.8 }}>
        <p>🔢 مجموع الكمية: {totalQty}</p>
        <p>💵 المدفوع: {paid.toLocaleString("ar-IQ")} د.ع</p>
        <p>🔻 الخصم: {discount.toLocaleString("ar-IQ")} د.ع</p>
        <p style={{ fontWeight: "bold" }}>
          💰 المبلغ النهائي: {totalAfterDiscount.toLocaleString("ar-IQ")} د.ع
        </p>
      </div>

      {/* Installment Details */}
      {order.type === "installment" && (
        <div style={{ marginTop: 10 }}>
          <p><strong>📄 تفاصيل الأقساط:</strong></p>
          <p>عدد الأقساط: {order.installmentsCount}</p>
          <p>الدفعة الأولى: {order.downPayment?.toLocaleString("ar-IQ")} د.ع</p>
          <p>المتبقي: {order.remaining?.toLocaleString("ar-IQ")} د.ع</p>
          {order.dueDate && <p>📅 تاريخ أول قسط: {new Date(order.dueDate).toLocaleDateString("ar-IQ")}</p>}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 30, borderTop: "1px dashed #000", paddingTop: 10 }}>
        <p style={{ textAlign: "center" }}>💡 الرجاء الاحتفاظ بالفاتورة كمرجع.</p>
      </div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid black",
  padding: "6px 4px",
  textAlign: "center",
  whiteSpace: "nowrap",
};
