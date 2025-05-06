// pages/admin/add-customer.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowLeft,
  Upload,
  Camera,
  Smartphone,
  Laptop,
  Headphones,
  Users,
  LayoutDashboard,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";
import * as uploadcare from "uploadcare-widget";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { motion } from "framer-motion";

const formStyles = [
  {
    name: "كلاسيكي",
    className: "p-6 max-w-xl mx-auto bg-white shadow rounded-lg",
  },
  {
    name: "بطاقات ملونة",
    className:
      "p-6 max-w-xl mx-auto bg-gradient-to-br from-green-50 via-white to-blue-50 shadow-xl rounded-xl border border-blue-100",
  },
  {
    name: "داكن",
    className:
      "p-6 max-w-xl mx-auto bg-gray-800 text-white shadow-xl rounded-xl border border-gray-700",
  },
];

export default function AddCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [formStyle, setFormStyle] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !address) {
      toast.error("❗ جميع الحقول مطلوبة");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, paymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم إضافة الزبون بنجاح");
        setName("");
        setPhone("");
        setAddress("");
        setPaymentStatus("paid");
        router.push("/admin/customers");
      } else {
        toast.error("❌ فشل في إضافة الزبون");
      }
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء الإرسال");
    }
    setLoading(false);
  };

  useEffect(() => {
    const sidebar = document.getElementById("admin-sidebar-links");
    if (sidebar) {
      const existing = document.getElementById("customers-link");
      if (!existing) {
        const link = document.createElement("a");
        link.id = "customers-link";
        link.href = "/admin/customers";
        link.className =
          "flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700";

        const icon = document.createElement("span");
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 14a4 4 0 1 0-8 0M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>`;

        const text = document.createElement("span");
        text.textContent = "قائمة الزبائن";

        link.appendChild(icon);
        link.appendChild(text);
        sidebar.appendChild(link);
      }
    }
  }, []);

  return (
    <AdminLayout>
      <div className="mb-4 px-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          🎨 اختر التنسيق:
        </label>
        <select
          className="border p-2 rounded"
          value={formStyle}
          onChange={(e) => setFormStyle(parseInt(e.target.value))}
        >
          {formStyles.map((s, i) => (
            <option key={i} value={i}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <motion.div
        className={formStyles[formStyle].className + " animate__animated animate__fadeIn"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-700 dark:text-white">➕ إضافة زبون جديد</h1>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> رجوع
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">👤 اسم الزبون</label>
            <input
              className="border p-2 rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">📞 رقم الهاتف</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">📍 العنوان</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">💳 حالة الدفع</label>
            <select
              className="border p-2 rounded w-full"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="paid">✅ مدفوع</option>
              <option value="cod">💵 الدفع عند الاستلام</option>
            </select>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "...جاري الحفظ" : "✅ حفظ الزبون"}
          </Button>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
