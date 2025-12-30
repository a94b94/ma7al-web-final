"use client";

import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Invoice from "@/components/Invoice";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, FileText } from "lucide-react";

interface Order {
  _id: string;
  phone: string;
  address?: string;

  // ✅ مهم للـ split
  storeId?: string;
  storeName?: string;

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
}

interface StoreInfo {
  name?: string;
  address?: string;
}

function formatDateAR(dateISO: string) {
  try {
    return new Date(dateISO).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return new Date(dateISO).toLocaleDateString("ar-EG");
  }
}

function formatIQD(amount?: number) {
  if (typeof amount !== "number") return "";
  try {
    return amount.toLocaleString("ar-IQ") + " د.ع";
  } catch {
    return amount.toLocaleString() + " د.ع";
  }
}

export default function OrderPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<Order | null>(null);
  const [storeInfo, setStoreInfo] = useState<Required<StoreInfo>>({
    name: "اسم متجرك هنا",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const orderId = useMemo(() => (typeof id === "string" ? id : ""), [id]);

  const fetchOrder = useCallback(async (oid: string, signal: AbortSignal) => {
    const res = await fetch(`/api/orders/${encodeURIComponent(oid)}`, { signal });
    if (!res.ok) {
      throw new Error("❌ فشل تحميل الطلب. تأكد من رقم الطلب أو حاول لاحقًا.");
    }
    const data = await res.json();
    const o = (data?.order || data) as Order;

    if (!o?._id || !Array.isArray(o.cart)) {
      throw new Error("⚠️ بيانات الطلب غير مكتملة.");
    }
    return o;
  }, []);

  const fetchStoreInfo = useCallback(
    async (storeId: string | undefined, signal: AbortSignal) => {
      // ✅ إذا ما عندك storeId، ما نكسر الصفحة
      if (!storeId) return null;

      // ✅ نتوقع endpoint يدعم storeId كـ query
      // إذا ما عندك هذا endpoint، راح يفشل ونستخدم fallback
      const res = await fetch(`/api/store-info?storeId=${encodeURIComponent(storeId)}`, {
        signal,
      });

      if (!res.ok) return null;
      const data = (await res.json()) as StoreInfo;
      return data;
    },
    []
  );

  const fetchAll = useCallback(
    async (oid: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        // 1) اجلب الطلب أولاً
        const o = await fetchOrder(oid, controller.signal);
        setOrder(o);

        // 2) حاول تجيب معلومات المتجر حسب storeId (مهم للـ split)
        const storeData = await fetchStoreInfo(o.storeId, controller.signal);

        setStoreInfo({
          // ✅ الأفضل: store-info من DB -> ثم storeName من الطلب -> ثم الافتراضي
          name: storeData?.name || o.storeName || "اسم متجرك هنا",
          // ✅ عنوان المتجر من store-info (إن وجد)
          address: storeData?.address || "",
        });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setOrder(null);
        setError(err?.message || "⚠️ حدث خطأ غير متوقع");
        setStoreInfo({ name: "اسم متجرك هنا", address: "" });
      } finally {
        setLoading(false);
      }
    },
    [fetchOrder, fetchStoreInfo]
  );

  useEffect(() => {
    if (!orderId) return;

    fetchAll(orderId);

    return () => {
      abortRef.current?.abort();
    };
  }, [orderId, fetchAll]);

  const handleBack = () => router.back();
  const handleRetry = () => {
    if (orderId) fetchAll(orderId);
  };

  const invoiceDate = useMemo(() => {
    return order?.createdAt ? formatDateAR(order.createdAt) : "";
  }, [order?.createdAt]);

  // ✅ عنوان يُعرض داخل الفاتورة: عنوان المتجر إن وجد، وإلا نقدر نعرض عنوان الطلب (اختياري)
  const invoiceAddress = useMemo(() => {
    // إذا تفضّل الفاتورة تعرض عنوان المتجر فقط، خليها storeInfo.address فقط
    return storeInfo.address || ""; // أو: storeInfo.address || order?.address || ""
  }, [storeInfo.address]);

  return (
    <div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full max-w-3xl">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:underline hover:text-blue-800"
          type="button"
        >
          <ArrowLeft size={20} />
          <span>رجوع</span>
        </button>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              <div className="mt-6 h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
                ⏳ جاري تحميل الفاتورة...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 mb-3">
                <FileText />
              </div>
              <p className="text-red-600 dark:text-red-300 font-semibold">{error}</p>

              <button
                onClick={handleRetry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                type="button"
              >
                <RefreshCw size={18} />
                إعادة المحاولة
              </button>

              <p className="mt-3 text-xs text-gray-500">
                إذا تكرر الخطأ، تأكد أن الطلب موجود وأن السيرفر يعمل.
              </p>
            </motion.div>
          ) : order ? (
            <motion.div
              key="invoice"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"
            >
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    رقم الطلب:
                  </span>{" "}
                  {order._id}
                </div>
                {invoiceDate && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      التاريخ:
                    </span>{" "}
                    {invoiceDate}
                  </div>
                )}
              </div>

              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border dark:border-gray-700">
                  <div className="text-xs text-gray-500">الإجمالي</div>
                  <div className="font-extrabold text-blue-600">{formatIQD(order.total)}</div>
                </div>
                <div className="p-3 rounded-xl border dark:border-gray-700">
                  <div className="text-xs text-gray-500">الخصم</div>
                  <div className="font-bold text-gray-800 dark:text-gray-100">
                    {formatIQD(order.discount || 0)}
                  </div>
                </div>
                <div className="p-3 rounded-xl border dark:border-gray-700">
                  <div className="text-xs text-gray-500">المتبقي</div>
                  <div className="font-bold text-gray-800 dark:text-gray-100">
                    {formatIQD(order.remaining ?? order.total)}
                  </div>
                </div>
              </div>

              <Invoice
                invoiceNumber={order._id}
                date={invoiceDate}
                companyName={storeInfo.name} // ✅ صار صحيح للـ split
                phone={order.phone}
                address={invoiceAddress}
                items={order.cart}
              />
            </motion.div>
          ) : (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center"
            >
              <p className="text-gray-600 dark:text-gray-300">📭 لم يتم العثور على الطلب</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                type="button"
              >
                العودة للمتجر
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
