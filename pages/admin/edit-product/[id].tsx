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
  const [discount, setDiscount] = useState(0);
  const [processor, setProcessor] = useState("");
  const [screen, setScreen] = useState("");
  const [battery, setBattery] = useState("");
  const [memory, setMemory] = useState("");
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
        setProcessor(data.processor || "");
        setScreen(data.screen || "");
        setBattery(data.battery || "");
        setMemory(data.memory || "");
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

    const highlightHtml = `
      <h2>${name}</h2>
      <p>تصميم أنيق وتصنيع متين</p>
      <ul>
        <li>المعالج: ${processor}</li>
        <li>الشاشة: ${screen}</li>
        <li>البطارية: ${battery}</li>
      </ul>
      <p>الذاكرة: ${memory}</p>
      <p class='text-lg font-bold'>السعر: ${Number(price).toLocaleString()} د.ع</p>
      <a href='/checkout' class='bg-blue-600 text-white px-4 py-2 rounded block w-fit mt-2'>اشترِ الآن</a>
    `;

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
        discount,
        processor,
        screen,
        battery,
        memory,
        highlightHtml
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
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المنتج" className="border p-2 rounded" />
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="السعر" className="border p-2 rounded" />
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="نسبة الخصم" className="border p-2 rounded" />
          <input type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="نوع المعالج" className="border p-2 rounded" />
          <input type="text" value={screen} onChange={(e) => setScreen(e.target.value)} placeholder="نوع الشاشة" className="border p-2 rounded" />
          <input type="text" value={battery} onChange={(e) => setBattery(e.target.value)} placeholder="حجم البطارية" className="border p-2 rounded" />
          <input type="text" value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="الذاكرة" className="border p-2 rounded" />

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
            <option value="mobiles">📱 موبايلات</option>
            <option value="laptops">💻 لابتوبات</option>
            <option value="headphones">🎧 سماعات</option>
            <option value="watches">⌚ ساعات</option>
            <option value="electronics">🔌 أجهزة كهربائية</option>
            <option value="extras">🧩 أخرى</option>
          </select>

          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              منتج مميز
            </label>
          </div>

          <input
            type="hidden"
            role="uploadcare-uploader"
            data-public-key="767dc761271f23d1f796"
            data-tabs="file url"
            data-images-only
            data-crop="free"
          />

          {image && <img src={image} alt="صورة المنتج" className="w-full h-48 object-cover rounded border" />}

          <button type="submit" disabled={loading} className="bg-green-600 text-white py-2 rounded">
            {loading ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
          </button>
        </form>
      </div>
    </>
  );
}
