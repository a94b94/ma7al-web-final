// ✅ صفحة: /admin/offline-invoices.tsx
"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function OfflineInvoicesPage() {
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const db = await import("@/lib/db/offlineStore");
    const p = await db.getAllPendingPurchaseInvoices();
    const s = await db.getAllPendingInvoices();
    setPurchaseInvoices(p);
    setSalesInvoices(s);
    setLoading(false);
  };

  const syncInvoice = async (invoice: any, type: "purchase" | "sales", index: number) => {
    const endpoint = type === "purchase" ? "/api/purchase-invoice/add" : "/api/sales/add";
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      const db = await import("@/lib/db/offlineStore");
      if (type === "purchase") {
        await db.removePendingPurchaseInvoice(index);
        toast.success("✅ تمت مزامنة فاتورة الشراء");
      } else {
        await db.removePendingInvoice(index);
        toast.success("✅ تمت مزامنة فاتورة البيع");
      }
      loadData();
    } catch {
      toast.error("❌ فشل المزامنة، تحقق من الاتصال");
    }
  };

  const deleteInvoice = async (type: "purchase" | "sales", index: number) => {
    const db = await import("@/lib/db/offlineStore");
    if (type === "purchase") await db.removePendingPurchaseInvoice(index);
    else await db.removePendingInvoice(index);
    toast.success("🗑️ تم حذف الفاتورة");
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">🗂️ فواتير غير متزامنة</h1>

        {loading ? (
          <p>...جارٍ التحميل</p>
        ) : (
          <>
            <Section title="🧾 فواتير الشراء" data={purchaseInvoices} type="purchase" syncInvoice={syncInvoice} deleteInvoice={deleteInvoice} />
            <Section title="💰 فواتير البيع" data={salesInvoices} type="sales" syncInvoice={syncInvoice} deleteInvoice={deleteInvoice} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Section({
  title,
  data,
  type,
  syncInvoice,
  deleteInvoice,
}: {
  title: string;
  data: any[];
  type: "purchase" | "sales";
  syncInvoice: (invoice: any, type: "purchase" | "sales", index: number) => void;
  deleteInvoice: (type: "purchase" | "sales", index: number) => void;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500">لا توجد فواتير محفوظة محليًا</p>
      ) : (
        <div className="space-y-4">
          {data.map((inv, idx) => (
            <div key={idx} className="p-4 bg-white rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-semibold">رقم الفاتورة: {inv.invoiceNumber || "-"}</p>
                <p className="text-sm text-gray-600">المنتجات: {inv.products?.length || 0}</p>
                <p className="text-sm text-gray-500">التاريخ: {inv.date?.slice(0, 10) || "-"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => syncInvoice(inv, type, idx)}>
                  <RefreshCcw className="w-4 h-4 mr-1" /> مزامنة
                </Button>
                <Button variant="destructive" onClick={() => deleteInvoice(type, idx)}>
                  <Trash className="w-4 h-4 mr-1" /> حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
