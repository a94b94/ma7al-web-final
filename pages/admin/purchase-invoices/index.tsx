// ✅ صفحة: /admin/purchase-invoices/index.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPendingPurchaseInvoices } from "@/lib/db/offlineStore";

interface PurchaseInvoice {
  invoiceNumber: string;
  supplierName: string;
  date: string;
  products: any[];
}

export default function PurchaseInvoicesPage() {
  const [pendingInvoices, setPendingInvoices] = useState<PurchaseInvoice[]>([]);

  useEffect(() => {
    const fetchPending = async () => {
      const list = await getAllPendingPurchaseInvoices();

      // ✅ تأكد أن كل العناصر تحتوي على الحقول المطلوبة
      const validList = list
        .filter(
          (inv: any) =>
            inv.invoiceNumber &&
            inv.supplierName &&
            inv.date &&
            Array.isArray(inv.products)
        )
        .map((inv: any) => ({
          invoiceNumber: inv.invoiceNumber,
          supplierName: inv.supplierName,
          date: inv.date,
          products: inv.products,
        }));

      setPendingInvoices(validList);
    };
    fetchPending();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧾 فواتير الشراء</h1>

      {pendingInvoices.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-semibold mb-2">
            ⚠️ لديك {pendingInvoices.length} فاتورة غير مزامنة (بسبب انقطاع الإنترنت)
          </p>
          <ul className="list-disc pl-5 text-sm">
            {pendingInvoices.map((inv, idx) => (
              <li key={idx}>
                رقم: {inv.invoiceNumber}، المورد: {inv.supplierName}، عدد المنتجات:{" "}
                {inv.products.length}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/admin/purchase-invoices/create"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ إنشاء فاتورة جديدة
      </Link>

      {/* ✅ هنا يمكن لاحقًا عرض جدول الفواتير المزامنة من السيرفر */}
    </div>
  );
}
