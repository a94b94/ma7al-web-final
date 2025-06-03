// components/Invoice.tsx
"use client";

import React, { useState } from "react";

type InvoiceItem = {
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

type InvoiceProps = {
  invoiceNumber: string | number;
  date: string;
  companyName: string;
  items: InvoiceItem[];
  phone?: string;
  address?: string;
};

export default function Invoice({
  invoiceNumber,
  date,
  companyName,
  items,
  phone,
  address,
}: InvoiceProps) {
  const [fontSize, setFontSize] = useState(14); // حجم الخط الافتراضي (px)

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const increaseFont = () => setFontSize((size) => Math.min(size + 2, 24));
  const decreaseFont = () => setFontSize((size) => Math.max(size - 2, 10));
  const resetFont = () => setFontSize(14);

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
      }}
    >
      {/* أزرار التحكم بحجم الخط - لا تظهر في الطباعة */}
      <div
        className="mb-4 flex gap-2 no-print"
        style={{ justifyContent: "center", marginBottom: 24 }}
      >
        <button
          onClick={decreaseFont}
          style={{
            padding: "4px 10px",
            cursor: "pointer",
            border: "1px solid #333",
            borderRadius: 4,
            backgroundColor: "#f0f0f0",
          }}
        >
          تصغير الخط
        </button>
        <button
          onClick={resetFont}
          style={{
            padding: "4px 10px",
            cursor: "pointer",
            border: "1px solid #333",
            borderRadius: 4,
            backgroundColor: "#f0f0f0",
          }}
        >
          إعادة الضبط
        </button>
        <button
          onClick={increaseFont}
          style={{
            padding: "4px 10px",
            cursor: "pointer",
            border: "1px solid #333",
            borderRadius: 4,
            backgroundColor: "#f0f0f0",
          }}
        >
          تكبير الخط
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: "4px 10px",
            cursor: "pointer",
            border: "1px solid #333",
            borderRadius: 4,
            backgroundColor: "#f0f0f0",
            marginLeft: 16,
          }}
        >
          🖨️ طباعة
        </button>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          fontSize: `${fontSize}px`,
        }}
      >
        <div>
          <strong style={{ marginRight: 8 }}>اسم الشركة:</strong> {companyName}
        </div>
        <div style={{ textAlign: "left" }}>
          <strong style={{ marginRight: 8 }}>رقم الفاتورة:</strong>{" "}
          <input
            type="text"
            value={invoiceNumber}
            readOnly
            style={{
              border: "1px solid #000",
              padding: "2px 8px",
              width: 100,
              textAlign: "center",
              direction: "ltr",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          fontSize: `${fontSize}px`,
        }}
      >
        <div>
          <strong style={{ marginRight: 8 }}>التاريخ:</strong> {date}
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
          fontSize: `${fontSize}px`,
        }}
      >
        <thead style={{ backgroundColor: "#999", color: "#fff" }}>
          <tr>
            <th style={cellStyle}>اسم المادة</th>
            <th style={cellStyle}>الوصف</th>
            <th style={cellStyle}>العدد</th>
            <th style={cellStyle}>سعر البيع</th>
            <th style={cellStyle}>المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={cellStyle}>{item.name}</td>
              <td style={cellStyle}>{item.description || "-"}</td>
              <td style={cellStyle}>{item.quantity}</td>
              <td style={cellStyle}>
                {item.price.toLocaleString("ar-IQ")} د.ع
              </td>
              <td style={cellStyle}>
                {(item.price * item.quantity).toLocaleString("ar-IQ")} د.ع
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: `${fontSize}px`,
          marginBottom: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              backgroundColor: "#999",
              color: "#fff",
              padding: "4px 10px",
              fontSize: `${fontSize}px`,
            }}
          >
            مجموع المواد
          </div>
          <input
            type="text"
            readOnly
            value={totalQuantity}
            style={{
              border: "1px solid #000",
              padding: "2px 8px",
              width: 50,
              textAlign: "center",
              direction: "ltr",
              fontSize: `${fontSize}px`,
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              backgroundColor: "#999",
              color: "#fff",
              padding: "4px 10px",
              fontSize: `${fontSize}px`,
            }}
          >
            المجموع
          </div>
          <input
            type="text"
            readOnly
            value={totalAmount.toLocaleString("ar-IQ")}
            style={{
              border: "1px solid #000",
              padding: "2px 8px",
              width: 100,
              textAlign: "center",
              direction: "ltr",
              fontSize: `${fontSize}px`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: `${fontSize - 2}px` }}>
        {address && <p>{address}</p>}
        {phone && <p>الهاتف: {phone}</p>}
      </div>

      {/* Print Styling */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .invoice-container {
            margin: 0;
            width: 100%;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Cairo', Tahoma, sans-serif;
          }
        }
      `}</style>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 4px",
  textAlign: "center",
};
