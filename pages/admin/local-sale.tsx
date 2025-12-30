"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import axios from "axios";
import Invoice from "@/components/Invoice";
import { useUser } from "@/context/UserContext";
import {
  saveOfflineInvoice,
  getAllOfflineInvoices,
  clearOfflineInvoices,
} from "@/lib/offlineDB";

const InstallmentTable = dynamic(
  () => import("@/components/installments/InstallmentTable"),
  { ssr: false }
);

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

function normalizeIraqiPhone(input: string) {
  let v = (input || "").trim();
  v = v.replace(/[\s\-().]/g, "");
  if (v.startsWith("00964")) v = "+964" + v.slice(5);
  if (v.startsWith("964")) v = "+964" + v.slice(3);
  if (v.startsWith("+9640")) v = "+964" + v.slice(5);
  return v;
}

export default function LocalSalePage() {
  const router = useRouter();
  const { user } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceType, setInvoiceType] = useState<"cash" | "installment">("cash");
  const [downPayment, setDownPayment] = useState(0);
  const [installmentsCount, setInstallmentsCount] = useState(0); // (موجودة عندك سابقًا، بس مو مستخدمة فعليًا)
  const [dueDate, setDueDate] = useState("");
  const [paid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date().toLocaleDateString("ar-EG"), []);

  // ✅ مزامنة الفواتير المحفوظة أوفلاين مع السيرفر
  const syncOfflineInvoices = useCallback(async () => {
    try {
      const invoices = await getAllOfflineInvoices();
      if (!invoices || invoices.length === 0) return;

      for (const invoice of invoices) {
        try {
          await axios.post("/api/local-sale/create", invoice);
        } catch (err) {
          console.error("فشل إرسال فاتورة مؤقتة:", invoice, err);
        }
      }

      toast.success("✅ تمت مزامنة الفواتير المحفوظة محليًا");
      await clearOfflineInvoices();
    } catch (err: any) {
      if (err?.name === "NotFoundError") {
        console.warn(
          "⚠️ Object store غير موجود في IndexedDB، تم تجاهل فواتير الأوفلاين القديمة.",
          err
        );
        return;
      }
      console.error("❌ خطأ أثناء مزامنة فواتير الأوفلاين:", err);
    }
  }, []);

  // ✅ جلب المنتجات (مع دعم شكلين للـ API)
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      // إذا تريد تربطها بمتجر المشرف (مفيد للمتاجر المتعددة)
      // عدّلها حسب شكل بيانات user عندك (user._id أو user.storeId)
      const storeId = (user as any)?._id || (user as any)?.storeId || "";
      const params: any = {};
      if (storeId) params.storeId = storeId;

      const res = await axios.get("/api/products", { params });

      // ✅ دعم: res.data = [] أو { products: [] }
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.products)
        ? res.data.products
        : [];

      // ✅ تنظيف الشكل الأدنى المطلوب للواجهة
      const normalized: Product[] = list
        .filter((p: any) => p && (p._id || p.id) && p.name)
        .map((p: any) => ({
          _id: String(p._id || p.id),
          name: String(p.name),
          price: Number(p.price || 0),
        }));

      setProducts(normalized);
    } catch (err) {
      console.error("خطأ في جلب المنتجات:", err);
      toast.error("فشل في جلب قائمة المنتجات");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // تاريخ الاستحقاق الافتراضي = اليوم
    setDueDate(new Date().toISOString().slice(0, 10));

    // رقم فاتورة عشوائي
    const randomId = Math.floor(100 + Math.random() * 900);
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    setInvoiceNumber(`INV-${dateCode}-${randomId}`);

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        syncOfflineInvoices();
      };

      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      if (navigator.onLine) syncOfflineInvoices();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [syncOfflineInvoices]);

  // ✅ جلب المنتجات بعد توفر user (حتى نحسب storeId لو لازم)
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: Product) => {
    const exists = cart.find((item) => item.productId === product._id);
    if (exists) {
      toast.error("المنتج موجود بالفعل في السلة");
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
      },
    ]);
  };

  const totalBeforeDiscount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () => Math.max(0, totalBeforeDiscount - discount),
    [totalBeforeDiscount, discount]
  );

  const autoInstallmentsCount = useMemo(() => {
    // نفس منطقك السابق
    return Math.max(1, Math.round((totalAmount - downPayment) / 100000));
  }, [totalAmount, downPayment]);

  const handleSaveInvoice = async () => {
    if (saving) return;

    const name = customerName.trim();
    const phone = normalizeIraqiPhone(customerPhone);

    if (!name) {
      toast.error("يرجى إدخال اسم الزبون");
      return;
    }
    if (!phone) {
      toast.error("يرجى إدخال رقم الهاتف");
      return;
    }
    if (cart.length === 0) {
      toast.error("السلة فارغة، أضف منتج واحد على الأقل");
      return;
    }

    const invoiceData = {
      customerName: name,
      phone,
      cart,
      total: totalAmount,
      type: invoiceType,
      downPayment,
      installmentsCount: invoiceType === "installment" ? autoInstallmentsCount : 0,
      dueDate,
      paid,
      discount,
      invoiceNumber,

      // ✅ مهم للمتاجر المتعددة (لو API local-sale يحتاج storeId)
      storeId: (user as any)?._id || (user as any)?.storeId || undefined,
      storeName: (user as any)?.storeName || undefined,
    };

    if (!isOnline) {
      try {
        await saveOfflineInvoice(invoiceData);
        toast.success("📴 تم حفظ الفاتورة مؤقتًا في جهازك لعدم وجود اتصال بالإنترنت");
      } catch (err) {
        console.error("فشل حفظ الفاتورة أوفلاين:", err);
        toast.error("فشل حفظ الفاتورة أوفلاين");
      }
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post("/api/local-sale/create", invoiceData);
      toast.success("✅ تم حفظ الفاتورة بنجاح");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("invoice:saved", { detail: { invoiceNumber } })
        );
      }

      router.push(`/admin/invoices/${res.data?.invoice?._id}`);
    } catch (err) {
      console.error("فشل في حفظ الفاتورة:", err);
      toast.error("فشل في حفظ الفاتورة");
    } finally {
      setSaving(false);
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="max-w-6xl mx-auto p-4 print:p-0" dir="rtl">
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-2 mb-4">
          🚫 لا يوجد اتصال بالإنترنت – سيتم حفظ الفاتورة مؤقتًا في جهازك
        </div>
      )}

      <h2 className="text-2xl font-bold mb-2 print:hidden">🧾 إنشاء فاتورة جديدة</h2>
      <p className="mb-2 text-sm text-gray-600 print:hidden">📅 التاريخ: {today}</p>
      <p className="mb-4 text-sm text-gray-600 print:hidden">
        رقم الفاتورة: <strong>{invoiceNumber}</strong>
      </p>

      {/* نوع الفاتورة */}
      <div className="mb-4 print:hidden">
        <label className="ml-4">
          <input
            type="radio"
            name="invoiceType"
            value="cash"
            checked={invoiceType === "cash"}
            onChange={() => setInvoiceType("cash")}
            className="ml-1"
          />
          نقد
        </label>
        <label>
          <input
            type="radio"
            name="invoiceType"
            value="installment"
            checked={invoiceType === "installment"}
            onChange={() => setInvoiceType("installment")}
            className="ml-1"
          />
          تقسيط
        </label>
      </div>

      {/* بيانات الزبون */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:hidden">
        <div>
          <label className="block text-sm mb-1">اسم الزبون</label>
          <input
            type="text"
            className="input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">رقم الهاتف</label>
          <input
            type="tel"
            className="input"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            onBlur={() => setCustomerPhone(normalizeIraqiPhone(customerPhone))}
          />
        </div>

        {invoiceType === "installment" && (
          <>
            <div>
              <label className="block text-sm mb-1">الدفعة الأولى</label>
              <input
                type="number"
                className="input"
                value={downPayment}
                onChange={(e) => setDownPayment(+e.target.value)}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">عدد الأقساط (محسوب تلقائيًا)</label>
              <input type="number" className="input" value={autoInstallmentsCount} readOnly />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm mb-1">المدفوع</label>
          <input
            type="number"
            className="input"
            value={paid}
            onChange={(e) => setPaid(+e.target.value)}
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">الخصم</label>
          <input
            type="number"
            className="input"
            value={discount}
            onChange={(e) => setDiscount(+e.target.value)}
            min={0}
          />
        </div>
      </div>

      {/* اختيار المنتجات */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">📦 المنتجات المتاحة:</h3>

          <button
            type="button"
            onClick={fetchProducts}
            className="text-sm px-3 py-1 rounded border hover:bg-gray-100"
            disabled={productsLoading}
          >
            {productsLoading ? "تحميل..." : "تحديث"}
          </button>
        </div>

        {productsLoading ? (
          <div className="text-sm text-gray-600">⏳ جاري تحميل المنتجات...</div>
        ) : safeProducts.length === 0 ? (
          <div className="text-sm text-gray-600">
            لا توجد منتجات منشورة حاليًا.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {safeProducts.map((product) => (
              <button
                key={product._id}
                className="border rounded p-2 hover:bg-blue-100"
                onClick={() => addToCart(product)}
                type="button"
              >
                {product.name} ({product.price.toLocaleString()} د.ع)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ عرض الفاتورة + الأقساط */}
      <div className="invoice-container mt-8">
        <Invoice
          invoiceNumber={invoiceNumber}
          date={today}
          companyName={(user as any)?.storeName || "المتجر"}
          phone={normalizeIraqiPhone(customerPhone)}
          address={(user as any)?.storeAddress || (user as any)?.address || ""}
          items={cart}
        />

        {invoiceType === "installment" && (
          <div className="mt-6">
            <InstallmentTable
              totalAmount={totalAmount}
              downPayment={downPayment}
              count={autoInstallmentsCount}
              startDate={dueDate}
              orderId={invoiceNumber}
              customerPhone={normalizeIraqiPhone(customerPhone)}
            />
          </div>
        )}
      </div>

      {/* أزرار */}
      <div className="flex gap-4 mt-4 print:hidden">
        <button
          onClick={handleSaveInvoice}
          className={`text-white px-6 py-2 rounded ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
          }`}
          disabled={saving}
          type="button"
        >
          {saving ? "⏳ جاري الحفظ..." : "💾 حفظ الفاتورة"}
        </button>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded"
          type="button"
        >
          🖨️ طباعة
        </button>
      </div>
    </div>
  );
}
