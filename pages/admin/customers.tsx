import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Upload, Camera, Smartphone, Laptop, Headphones, Users } from "lucide-react";
import toast from "react-hot-toast";
import * as uploadcare from "uploadcare-widget";
import { BrowserMultiFormatReader } from "@zxing/browser";

const categories = [
  { value: "mobiles", label: "📱 هواتف", icon: Smartphone },
  { value: "laptops", label: "💻 لابتوبات", icon: Laptop },
  { value: "accessories", label: "🎧 إكسسوارات", icon: Headphones },
];

export default function AddCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [dueDate, setDueDate] = useState("");
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
        body: JSON.stringify({ name, phone, address, paymentStatus, dueDate }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم إضافة الزبون بنجاح");
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
        link.className = "flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700";
        link.innerHTML = `${Users({ className: "w-4 h-4" }).outerHTML}<span>قائمة الزبائن</span>`;
        sidebar.appendChild(link);
      }
    }
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-700">➕ إضافة زبون جديد</h1>
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

          <div>
            <label className="block text-sm font-medium mb-1">⏰ تاريخ الاستحقاق</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "...جاري الحفظ" : "✅ حفظ الزبون"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
