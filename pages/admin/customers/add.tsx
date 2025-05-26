import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function AddCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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
        body: JSON.stringify({ name, phone, address }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم إضافة الزبون بنجاح");
        router.push("/admin/customers");
      } else {
        toast.error(data.error || "❌ فشل في إضافة الزبون");
      }
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء الإرسال");
    }
    setLoading(false);
  };

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
