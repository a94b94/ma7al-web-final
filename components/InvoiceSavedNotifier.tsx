// components/InvoiceSavedNotifier.tsx
"use client";

import { useEffect, useState } from "react";

export default function InvoiceSavedNotifier() {
  const [visible, setVisible] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    const handler = (e: any) => {
      setInvoiceNumber(e.detail.invoiceNumber);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    window.addEventListener("invoice:saved", handler);
    return () => window.removeEventListener("invoice:saved", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded shadow-lg z-50">
      ✅ تم حفظ الفاتورة بنجاح: <strong>{invoiceNumber}</strong>
    </div>
  );
}
