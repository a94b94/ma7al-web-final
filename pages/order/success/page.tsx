"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { CheckCircle2, FileText, Home, Copy, List } from "lucide-react";

function parseOrderIds(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();

  const orderId = useMemo(() => {
    const v = params.get("orderId") || "";
    return v.trim();
  }, [params]);

  // ✅ دعم split orders: orderIds=id1,id2,id3
  const orderIds = useMemo(() => {
    const list = parseOrderIds(params.get("orderIds"));
    // إذا لم تُرسل orderIds، استخدم orderId كقائمة واحدة (إن وجد)
    if (list.length === 0 && orderId) return [orderId];
    // تأكد أن orderId موجود داخل القائمة (إن كان موجودًا)
    if (orderId && !list.includes(orderId)) return [orderId, ...list];
    return list;
  }, [params, orderId]);

  const handleCopy = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success("تم نسخ رقم الطلب");
    } catch {
      toast.error("تعذر نسخ رقم الطلب");
    }
  };

  const handleCopyAll = async () => {
    if (orderIds.length === 0) return;
    try {
      await navigator.clipboard.writeText(orderIds.join(","));
      toast.success("تم نسخ جميع أرقام الطلبات");
    } catch {
      toast.error("تعذر نسخ أرقام الطلبات");
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-10 flex items-center justify-center"
      dir="rtl"
    >
      <motion.div
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <CheckCircle2 />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
              تم استلام طلبك بنجاح
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              سنقوم بالتواصل لتأكيد الطلب. يمكنك حفظ رقم الطلب لسهولة المتابعة.
            </p>
          </div>
        </div>

        {/* رقم الطلب الأساسي */}
        {orderId ? (
          <div className="mt-4 p-4 rounded-xl border dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-gray-500">رقم الطلب</div>
                <div className="font-mono font-bold text-gray-900 dark:text-white break-all">
                  {orderId}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy size={18} />
                <span className="text-sm font-semibold">نسخ</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl border dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
            لم يتم العثور على رقم الطلب. يمكنك العودة للمتجر أو مراجعة صفحة الطلب إن كانت لديك.
          </div>
        )}

        {/* ✅ في حال split: اعرض قائمة فواتير */}
        {orderIds.length > 1 && (
          <div className="mt-4 p-4 rounded-xl border dark:border-gray-700">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-bold">
                <List size={18} />
                <span>تم إنشاء أكثر من فاتورة</span>
              </div>

              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy size={18} />
                <span className="text-sm font-semibold">نسخ الكل</span>
              </button>
            </div>

            <div className="space-y-2">
              {orderIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => router.push(`/order/${encodeURIComponent(id)}`)}
                  className="w-full text-right p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-700"
                >
                  <div className="text-xs text-gray-500">فاتورة</div>
                  <div className="font-mono font-bold text-gray-900 dark:text-white break-all">
                    {id}
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-500 text-center">
              اختر أي فاتورة لعرضها.
            </p>
          </div>
        )}

        {/* أزرار أساسية */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Home size={18} />
            العودة للمتجر
          </button>

          <button
            type="button"
            onClick={() => {
              if (!orderId) {
                toast.error("لا يوجد رقم طلب لعرض الفاتورة");
                return;
              }
              router.push(`/order/${encodeURIComponent(orderId)}`);
            }}
            className={`inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold ${
              orderId
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
            }`}
            disabled={!orderId}
          >
            <FileText size={18} />
            عرض الفاتورة
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          إذا لم تظهر الفاتورة، قد يكون الطلب قيد المعالجة لبضع ثوانٍ.
        </p>
      </motion.div>
    </div>
  );
}
