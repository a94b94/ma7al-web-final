import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const styles = [
  {
    id: 0,
    name: "كلاسيكي",
    previewClass: "bg-white border rounded shadow p-4",
  },
  {
    id: 1,
    name: "بطاقات ملونة",
    previewClass: "bg-gradient-to-r from-green-100 to-blue-100 border rounded-xl p-4 shadow-xl",
  },
  {
    id: 2,
    name: "داكن",
    previewClass: "bg-gray-800 text-white p-4 rounded shadow",
  },
];

export default function StoreSettingsPage() {
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("themeStyle");
    if (stored) setSelected(parseInt(stored));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      localStorage.setItem("themeStyle", selected.toString());
      toast.success("✅ تم حفظ التنسيق المفضل")
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء الحفظ")
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">🎨 إعدادات المظهر</h1>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {styles.map((style) => (
            <div
              key={style.id}
              className={`cursor-pointer border-2 rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
                selected === style.id ? "border-blue-600" : "border-gray-300"
              }`}
              onClick={() => setSelected(style.id)}
            >
              <div className={`h-24 ${style.previewClass} flex items-center justify-center text-sm font-medium`}>
                {style.name}
              </div>
              {selected === style.id && (
                <div className="text-blue-600 mt-2 flex items-center gap-1">
                  <CheckCircle size={16} /> تم الاختيار
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {saving ? "...جاري الحفظ" : "💾 حفظ التنسيق"}
        </Button>
      </div>
    </AdminLayout>
  );
}
