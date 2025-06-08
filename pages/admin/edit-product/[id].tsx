// ✅ نسخة مطورة تدعم تعديل صور متعددة للمنتج باستخدام Cloudinary

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import axios from "axios";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("mobiles");
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([]);
  const [featured, setFeatured] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [processor, setProcessor] = useState("");
  const [screen, setScreen] = useState("");
  const [battery, setBattery] = useState("");
  const [memory, setMemory] = useState("");
  const [loading, setLoading] = useState(false);

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
        if (!data) return toast.error("❌ لا توجد بيانات");
        setName(data.name || "");
        setPrice(data.price?.toString() || "");
        setCategory(data.category || "mobiles");
        setImages(data.images || []);
        setFeatured(data.featured || false);
        setDiscount(data.discount || 0);
        setProcessor(data.processor || "");
        setScreen(data.screen || "");
        setBattery(data.battery || "");
        setMemory(data.memory || "");
      });
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: { url: string; public_id: string }[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await axios.post("/api/upload", { imageBase64: reader.result });
          newImages.push({ url: res.data.url, public_id: res.data.public_id });
          setImages((prev) => [...prev, ...newImages]);
        } catch {
          toast.error("❌ فشل رفع الصورة");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (public_id: string) => {
    setImages(images.filter((img) => img.public_id !== public_id));
  };

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

    try {
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
          images,
          featured,
          discount,
          processor,
          screen,
          battery,
          memory,
          highlightHtml,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ تم التحديث بنجاح");
        router.push(`/product/${id}`);
      } else {
        toast.error("❌ " + (data.message || "حدث خطأ"));
      }
    } catch (err) {
      toast.error("❌ فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
    <motion.div
      className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">🛠️ تعديل المنتج</h1>
        <button onClick={handleDelete} className="text-red-600 hover:underline text-sm">
          🗑️ حذف المنتج
        </button>
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

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          منتج مميز
        </label>

        <div>
          <label className="font-medium">صور المنتج</label>
          <input type="file" accept="image/*" multiple onChange={handleUpload} />
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img) => (
              <div key={img.public_id} className="relative w-24 h-24">
                <img src={img.url} alt="صورة المنتج" className="w-full h-full object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.public_id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="bg-green-600 text-white py-2 rounded">
          {loading ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
        </button>
      </form>
    </motion.div>
  );
}
