"use client";

import React from "react";

type CartItem = {
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

type OrderType = {
  _id: string;
  phone: string;
  customerName?: string;
  cart: CartItem[];
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

type InvoiceProps = {
  order: OrderType;
  storeName: string;
};

export default function InvoicePreview({ order, storeName }: InvoiceProps) {
  const totalQuantity = order.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = order.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discount || 0;
  const paid = order.paid || 0;
  const remaining = order.remaining || (totalAmount - paid - discount);

  return (
    <div
      className="invoice-container"
      style={{
        fontFamily: "'Cairo', Tahoma, sans-serif",
        direction: "rtl",
        padding: 20,
        backgroundColor: "#fff",
        color: "#000",
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        border: "1px solid #000",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <strong>اسم المتجر: </strong> {storeName}
        </div>
        <button
          onClick={() => window.print()}
          style={{
            padding: "4px 10px",
            cursor: "pointer",
            border: "1px solid #333",
            borderRadius: 4,
            backgroundColor: "#f0f0f0",
            fontWeight: "bold",
          }}
          className="no-print"
        >
          طباعة
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <strong>رقم الفاتورة:</strong>{" "}
          <input
            type="text"
            value={order._id}
            readOnly
            style={{
              border: "1px solid #000",
              padding: "2px 8px",
              width: 150,
              textAlign: "center",
              direction: "ltr",
            }}
          />
        </div>
        <div>
          <strong>التاريخ:</strong>{" "}
          <input
            type="text"
            value={new Date(order.createdAt).toLocaleDateString("ar-IQ")}
            readOnly
            style={{
              border: "1px solid #000",
              padding: "2px 8px",
              width: 180,
              textAlign: "center",
              direction: "ltr",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000",
          marginBottom: 20,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        <thead style={{ backgroundColor: "#999", color: "#fff" }}>
          <tr>
            <th style={{ border: "1px solid #000", padding: 6 }}>اسم المادة</th>
            <th style={{ border: "1px solid #000", padding: 6 }}>الوصف</th>
            <th style={{ border: "1px solid #000", padding: 6 }}>العدد</th>
            <th style={{ border: "1px solid #000", padding: 6 }}>السعر</th>
            <th style={{ border: "1px solid #000", padding: 6 }}>المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {order.cart.map((item, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #000", padding: 6 }}>{item.name}</td>
              <td style={{ border: "1px solid #000", padding: 6 }}>{item.description || "-"}</td>
              <td style={{ border: "1px solid #000", padding: 6 }}>{item.quantity}</td>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                {item.price.toLocaleString("ar-IQ")} د.ع
              </td>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                {(item.price * item.quantity).toLocaleString("ar-IQ")} د.ع
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ fontSize: 15, display: "flex", flexDirection: "column", gap: 8 }}>
        <div><strong>المجموع الكلي:</strong> {totalAmount.toLocaleString("ar-IQ")} د.ع</div>
        <div><strong>الخصم:</strong> {discount.toLocaleString("ar-IQ")} د.ع</div>
        <div><strong>المدفوع:</strong> {paid.toLocaleString("ar-IQ")} د.ع</div>
        <div><strong>المتبقي:</strong> {remaining.toLocaleString("ar-IQ")} د.ع</div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 60, textAlign: "center", fontSize: 13 }}>
        <p>اسم الزبون: {order.customerName || "-"}</p>
        <p>رقم الهاتف: {order.phone || "-"}</p>
        {order.type === "installment" && (
          <>
            <p>نوع الفاتورة: أقساط</p>
            <p>الدفعة الأولى: {order.downPayment?.toLocaleString("ar-IQ")} د.ع</p>
            <p>عدد الأقساط: {order.installmentsCount}</p>
            <p>تاريخ أول قسط: {order.dueDate}</p>
          </>
        )}
      </div>
    </div>
  );
}
