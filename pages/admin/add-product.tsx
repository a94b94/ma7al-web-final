// ✅ نسخة مطورة من صفحة إضافة منتج - دعم رفع صور متعددة، حذف من Cloudinary، تحسين تجربة المستخدم

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Camera,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  PlugZap,
  Package,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { motion } from "framer-motion";
import axios from "axios";

const categories = [
  { value: "mobiles", label: "📱 موبايلات", icon: Smartphone },
  { value: "laptops", label: "💻 لابتوبات", icon: Laptop },
  { value: "headphones", label: "🎧 سماعات", icon: Headphones },
  { value: "watches", label: "⌚ ساعات", icon: Watch },
  { value: "electronics", label: "🔌 أجهزة كهربائية", icon: PlugZap },
  { value: "other", label: "📦 أخرى", icon: Package },
];

export default function AddProductPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [processor, setProcessor] = useState("");
  const [screen, setScreen] = useState("");
  const [battery, setBattery] = useState("");
  const [memory, setMemory] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const reader = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(file);
        });

        const res = await axios.post("/api/upload", { imageBase64: reader });
        return { url: res.data.url, public_id: res.data.public_id };
      });

      const results = await Promise.all(uploads);
      setImages((prev) => [...prev, ...results]);
    } catch (err) {
      console.error("❌ Error uploading images", err);
      toast.error("فشل رفع بعض الصور");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (public_id: string) => {
    setImages((prev) => prev.filter((img) => img.public_id !== public_id));
    try {
      await axios.post("/api/delete-image", { public_id });
    } catch (err) {
      console.error("❌ فشل حذف من Cloudinary", err);
    }
  };

  const handleSubmit = async () => {
    if (!barcode || !name || !price || !category || images.length === 0) {
      toast.error("❗ جميع الحقول مطلوبة");
      return;
    }

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
      <p class='text-lg font-bold'>السعر: ${price.toLocaleString()} د.ع</p>
      <a href='/checkout' class='bg-blue-600 text-white px-4 py-2 rounded block w-fit mt-2'>اشترِ الآن</a>
    `;

    try {
      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode,
          name,
          price,
          category,
          images,
          discount,
          highlightHtml,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم إضافة المنتج بنجاح");
        router.push("/admin/products");
      } else {
        toast.error("❌ فشل في إضافة المنتج");
      }
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء الإرسال");
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <motion.div
        className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-700">➕ إضافة منتج جديد</h1>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> رجوع
          </Button>
        </div>

        <div className="space-y-4">
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="📦 باركود المنتج" className="border p-2 rounded w-full" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="📛 اسم المنتج" className="border p-2 rounded w-full" />
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="💰 السعر" className="border p-2 rounded w-full" />
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="🏷️ نسبة الخصم" className="border p-2 rounded w-full" />

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  type="button"
                  className={`flex items-center gap-2 border p-2 rounded text-sm w-full ${category === cat.value ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"}`}
                >
                  <Icon className="w-4 h-4" /> {cat.label}
                </button>
              );
            })}
          </div>

          <input type="file" multiple accept="image/*" onChange={handleUploadImages} />
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <div key={img.public_id} className="relative w-24 h-24">
                <img src={img.url} alt="صورة" className="w-full h-full object-cover rounded" />
                <button onClick={() => handleDeleteImage(img.public_id)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <input value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="🖥️ المعالج" className="border p-2 rounded w-full" />
          <input value={screen} onChange={(e) => setScreen(e.target.value)} placeholder="🖼️ الشاشة" className="border p-2 rounded w-full" />
          <input value={battery} onChange={(e) => setBattery(e.target.value)} placeholder="🔋 البطارية" className="border p-2 rounded w-full" />
          <input value={memory} onChange={(e) => setMemory(e.target.value)} placeholder="💾 الذاكرة" className="border p-2 rounded w-full" />

          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "⏳ جاري الحفظ..." : "✅ حفظ المنتج"}
          </Button>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
