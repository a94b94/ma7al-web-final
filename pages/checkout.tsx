"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MapPin, ShieldCheck } from "lucide-react";

type PaymentMethod = "cash" | "card";

/**
 * ✅ تنظيف رقم الهاتف:
 * - إزالة الفراغات والرموز
 * - تحويل 00964 إلى +964
 * - السماح بصيغ شائعة داخل العراق: 07xxxxxxxxx أو +9647xxxxxxxxx
 */
function normalizeIraqiPhone(input: string) {
  let v = (input || "").trim();

  // Remove spaces and common separators
  v = v.replace(/[\s\-().]/g, "");

  // Convert 00964 -> +964
  if (v.startsWith("00964")) v = "+964" + v.slice(5);

  // If starts with 964 without +
  if (v.startsWith("964")) v = "+964" + v.slice(3);

  // If user wrote +9640..., remove the 0 after country code
  if (v.startsWith("+9640")) v = "+964" + v.slice(5);

  return v;
}

/**
 * ✅ تحقق رقم الهاتف العراقي:
 * يقبل:
 * - 07xxxxxxxxx
 * - +9647xxxxxxxxx
 */
function isValidIraqiPhone(phone: string) {
  const v = normalizeIraqiPhone(phone);
  if (/^07\d{9}$/.test(v)) return true;
  if (/^\+9647\d{9}$/.test(v)) return true;
  return false;
}

function formatIQD(amount: number) {
  try {
    return amount.toLocaleString("ar-IQ") + " د.ع";
  } catch {
    return amount.toLocaleString() + " د.ع";
  }
}

// تنظيف العنوان: إزالة فراغات زائدة وتوحيد المسافات
function normalizeAddress(input: string) {
  return (input || "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, "، ")
    .trim();
}

const STORAGE_KEY = "ma7al_checkout_v1";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(false);

  // لمنع الإرسال المكرر حتى لو حصل lag
  const submittingRef = useRef(false);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const isCartEmpty = cart.length === 0;

  // ✅ استرجاع بيانات المستخدم لتسهيل الطلب القادم
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.phone === "string") setPhone(parsed.phone);
      if (typeof parsed.address === "string") setAddress(parsed.address);
    } catch {
      // ignore
    }
  }, []);

  // ✅ حفظ البيانات تلقائيًا (بدون إزعاج)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          phone: phone.slice(0, 20),
          address: address.slice(0, 300),
        })
      );
    } catch {
      // ignore
    }
  }, [phone, address]);

  const handleSubmit = async () => {
    if (loading || submittingRef.current) return;

    // ✅ سلة فارغة
    if (isCartEmpty) {
      toast.error("سلة الشراء فارغة. أضف منتجات ثم حاول مرة أخرى.");
      router.push("/");
      return;
    }

    const normalizedPhone = normalizeIraqiPhone(phone);
    const normalizedAddr = normalizeAddress(address);

    if (!normalizedPhone) {
      toast.error("يرجى إدخال رقم الهاتف.");
      return;
    }

    if (!isValidIraqiPhone(normalizedPhone)) {
      toast.error("رقم الهاتف غير صحيح. مثال: 07xxxxxxxxx أو +9647xxxxxxxxx");
      return;
    }

    if (!normalizedAddr || normalizedAddr.length < 6) {
      toast.error("يرجى إدخال عنوان واضح (على الأقل 6 أحرف).");
      return;
    }

    setLoading(true);
    submittingRef.current = true;

    const storeId = (cart as any[])?.[0]?.storeId ?? null;

    const payload = {
      phone: normalizedPhone,
      address: normalizedAddr,
      paymentMethod,
      cart,
      totalAmount,
      storeId,
      meta: {
        source: "web",
        createdAt: new Date().toISOString(),
      },
    };

    try {
      const res = await fetch("/api/orders/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok) {
        toast.success("تم تأكيد الطلب بنجاح!");
        clearCart();

        // ✅ بعد تحديث API: primaryOrderId + orderIds
        const primaryOrderId: string =
          data?.primaryOrderId ||
          data?.orderId ||
          data?.id ||
          data?.orderIds?.[0] ||
          "";

        const orderIdsArray: string[] = Array.isArray(data?.orderIds)
          ? data.orderIds.filter(Boolean).map((x: any) => String(x))
          : [];

        const orderIdsCsv = orderIdsArray.length ? orderIdsArray.join(",") : "";

        // ✅ next/navigation router.push() يرجع void (لا يوجد catch)
        if (primaryOrderId) {
          const url =
            `/order/success?orderId=${encodeURIComponent(primaryOrderId)}` +
            (orderIdsCsv ? `&orderIds=${encodeURIComponent(orderIdsCsv)}` : "");

          router.push(url);
        } else {
          router.push("/order/success");
        }
      } else {
        const msg =
          data?.error ||
          data?.message ||
          "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.";
        toast.error(msg);
      }
    } catch {
      toast.error("فشل الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <motion.div
      dir="rtl"
      className="max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* زر رجوع */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:underline"
        type="button"
      >
        <ArrowLeft size={18} />
        <span>رجوع</span>
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إتمام الطلب
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            اكتب رقمك وعنوانك فقط، وسنتواصل لتأكيد الطلب عبر واتساب.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-emerald-600">
          <ShieldCheck size={18} />
          <span className="text-sm font-semibold">طلب آمن</span>
        </div>
      </div>

      {isCartEmpty ? (
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800">
          <p className="text-gray-700 dark:text-gray-200">
            سلة الشراء فارغة. رجوع للمتجر لإضافة منتجات.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-3 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            العودة للمتجر
          </button>
        </div>
      ) : (
        <>
          {/* رقم الهاتف */}
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            رقم الهاتف
          </label>
          <motion.div
            className="relative mb-4"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="tel"
              inputMode="tel"
              placeholder="مثال: 07xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setPhone(normalizeIraqiPhone(phone))}
              className="w-full p-3 pl-10 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-white"
              disabled={loading}
              aria-label="رقم الهاتف"
            />
            <p className="text-xs text-gray-500 mt-2">
              يقبل: 07xxxxxxxxx أو +9647xxxxxxxxx
            </p>
          </motion.div>

          {/* العنوان */}
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            العنوان الكامل
          </label>
          <motion.div
            className="relative mb-4"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MapPin size={18} className="absolute left-3 top-4 text-gray-400" />
            <textarea
              placeholder="مثال: البصرة - الجزائر - قرب ... - رقم الدار ..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setAddress(normalizeAddress(address))}
              className="w-full p-3 pl-10 min-h-[110px] border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-white"
              disabled={loading}
              aria-label="العنوان"
            />
            <p className="text-xs text-gray-500 mt-2">
              كلما كان العنوان أوضح، صار التوصيل أسرع.
            </p>
          </motion.div>

          {/* طريقة الدفع */}
          <motion.div
            className="space-y-2 mb-6 p-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              طريقة الدفع
            </p>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="w-4 h-4"
                disabled={loading}
              />
              <span className="text-gray-800 dark:text-gray-100">
                الدفع عند الاستلام
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="w-4 h-4"
                disabled
              />
              <span className="text-gray-400">بطاقة إلكترونية (قريبًا)</span>
            </label>
          </motion.div>

          {/* الإجمالي */}
          <motion.div
            className="mb-4 flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gray-700 dark:text-gray-200 font-semibold">
              الإجمالي
            </span>
            <span className="text-lg font-extrabold text-blue-600">
              {formatIQD(totalAmount)}
            </span>
          </motion.div>

          {/* زر التأكيد */}
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            className={`w-full text-white py-3 rounded-xl font-bold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </motion.button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            بالضغط على “تأكيد الطلب” أنت توافق على إرسال بيانات الطلب للتأكيد.
          </p>
        </>
      )}
    </motion.div>
  );
}
