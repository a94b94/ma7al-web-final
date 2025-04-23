import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("mobiles");
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [discount, setDiscount] = useState(0); // ✅ نسبة الخصم
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("🚫 غير مسموح. سجل الدخول أولاً.");
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "mobiles");
        setImage(data.image || "");
        setFeatured(data.featured || false);
        setDiscount(data.discount || 0);
      });
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).uploadcare && (window as any).uploadcare.Widget) {
        clearInterval(interval);
        const widget = (window as any).uploadcare.Widget(
          "[role=uploadcare-uploader]"
        );
        widget.onUploadComplete((info: any) => {
          setImage(info.cdnUrl);
          toast.success("✅ تم رفع الصورة بنجاح!");
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/admin/update-product/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        category,
        image,
        featured,
        discount
      }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("✅ تم تحديث المنتج");
      router.push(`/product/${id}`);
    } else {
      console.error("❌ خطأ من الخادم:", data.message);
      toast.error("❌ " + data.message);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirm = window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟");
    if (!confirm) return;
    try {
      const res = await fetch(`/api/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        toast.success("🗑️ تم حذف المنتج");
        router.push("/admin/products");
      } else {
        toast.error("❌ فشل في حذف المنتج");
      }
    } catch {
      toast.error("❌ حدث خطأ أثناء الحذف");
    }
  };

  return (
    <>
      <Script
        src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js"
        strategy="afterInteractive"
      />

      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">🛠️ تعديل المنتج</h1>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <MoreVertical size={24} />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 bg-white border shadow rounded-md w-52 text-sm z-50">
                <button
                  className="w-full text-right px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push("/admin/products")}
                >
                  📋 قائمة المنتجات
                </button>
                <button
                  className="w-full text-right px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push("/admin/add-product")}
                >
                  ➕ إضافة منتج
                </button>
                <button
                  className="w-full text-right px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleDelete}
                >
                  🗑️ حذف المنتج
                </button>
                <button
                  className="w-full text-right px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push("/admin")}
                >
                  🏠 رجوع للوحة التحكم
                </button>
                <button
                  className="w-full text-right px-4 py-2 hover:bg-gray-100"
                  onClick={() => router.push(`/product/${id}`)}
                >
                  👁️ عرض المنتج
                </button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block mb-1 text-sm font-semibold">📦 اسم المنتج</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-3 rounded-xl"
              placeholder="مثال: iPhone 15 Pro"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">💵 السعر</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-3 rounded-xl"
              placeholder="مثال: 1250000"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">🏷️ نسبة الخصم (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border p-3 rounded-xl"
              placeholder="مثال: 10"
              min={0}
              max={90}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">📂 الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-3 rounded-xl"
            >
              <option value="mobiles">📱 موبايلات</option>
              <option value="laptops">💻 لابتوبات</option>
              <option value="internet-devices">🌐 أجهزة الإنترنت</option>
              <option value="headphones">🎧 سماعات</option>
              <option value="watches">⌚ ساعات</option>
              <option value="accessories">🎮 ملحقات</option>
              <option value="extras">🧩 إكسسوارات</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5"
            />
            <label className="text-sm">🔥 اجعل المنتج مميزًا</label>
          </div>

          <input
            type="hidden"
            role="uploadcare-uploader"
            data-public-key="767dc761271f23d1f796"
            data-tabs="file url"
            data-images-only
            data-crop="free"
          />

          {image && (
            <img
              src={image}
              alt="معاينة الصورة"
              className="w-full h-48 object-cover rounded-xl border"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold"
          >
            {loading ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
          </button>
        </form>
      </div>
    </>
  );
}
