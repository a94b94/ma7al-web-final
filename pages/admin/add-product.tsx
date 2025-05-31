import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Upload,
  Camera,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  PlugZap,
  Package
} from "lucide-react";
import toast from "react-hot-toast";
import * as uploadcare from "uploadcare-widget";
import { BrowserMultiFormatReader } from "@zxing/browser";

const categories = [
  { value: "mobiles", label: "📱 موبايلات", icon: Smartphone },
  { value: "laptops", label: "💻 لابتوبات", icon: Laptop },
  { value: "headphones", label: "🎧 سماعات", icon: Headphones },
  { value: "watches", label: "⌚ ساعات", icon: Watch },
  { value: "electronics", label: "🔌 أجهزة كهربائية", icon: PlugZap },
  { value: "other", label: "📦 أخرى", icon: Package }
];

export default function AddProductPage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [highlightHtml, setHighlightHtml] = useState("");
  const [processor, setProcessor] = useState("");
  const [screen, setScreen] = useState("");
  const [battery, setBattery] = useState("");
  const [memory, setMemory] = useState("");
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (scanning && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          setBarcode(result.getText());
          checkBarcode(result.getText());
          setScanning(false);
        }
      });
    }
  }, [scanning]);

  const handleScan = (e: any) => {
    const code = e.target.value;
    setBarcode(code);
    if (code.length >= 5) {
      checkBarcode(code);
    }
  };

  const checkBarcode = async (code: string) => {
    setChecking(true);
    try {
      const res = await fetch(`/api/products/barcode-check?barcode=${code}`);
      const data = await res.json();
      if (data.exists) {
        setName(data.product.name);
        setPrice(data.product.price);
        setCategory(data.product.category);
        setImage(data.product.image);
        toast.success("✅ تم العثور على المنتج وتعبئة البيانات");
      } else {
        toast("🔎 لم يتم العثور على باركود مطابق");
      }
    } catch (err) {
      toast.error("فشل في التحقق من الباركود");
    }
    setChecking(false);
  };

  const handleSubmit = async () => {
    if (!barcode || !name || !price || !category) {
      toast.error("❗ جميع الحقول مطلوبة");
      return;
    }
    setLoading(true);
    try {
      const highlightContent = `
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

      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, name, price, category, image, discount, highlightHtml: highlightContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم إضافة المنتج بنجاح");
        setBarcode("");
        setName("");
        setPrice(0);
        setCategory("");
        setImage("");
        setDiscount(0);
        setHighlightHtml("");
        setProcessor("");
        setScreen("");
        setBattery("");
        setMemory("");
      } else {
        toast.error("❌ فشل في إضافة المنتج");
      }
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء الإرسال");
    }
    setLoading(false);
  };

  const openUploadWidget = () => {
    // @ts-ignore
    uploadcare.openDialog(null, { publicKey: "767dc761271f23d1f796" })
      .done((file) => file.done((info: any) => setImage(info.cdnUrl)));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-xl mx-auto bg-white shadow rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-700">➕ إضافة منتج جديد</h1>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> رجوع
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">📦 باركود المنتج</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={barcode}
                onChange={handleScan}
                placeholder="استخدم الماسح أو أدخل يدوياً"
                className="border p-2 rounded w-full"
              />
              <Button type="button" variant="outline" onClick={() => setScanning(true)}>
                <Camera className="w-4 h-4 mr-1" /> ماسح
              </Button>
            </div>
            {scanning && <video ref={videoRef} className="mt-2 w-full rounded border" />}
            {checking && <p className="text-sm text-gray-400">جاري التحقق...</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">📛 اسم المنتج</label>
            <input
              className="border p-2 rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">💰 السعر (د.ع)</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🏷️ نسبة الخصم (%)</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={discount}
              min={0}
              max={90}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="مثلاً: 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🖥️ نوع المعالج</label>
            <input
              className="border p-2 rounded w-full"
              value={processor}
              onChange={(e) => setProcessor(e.target.value)}
              placeholder="مثلاً: Snapdragon 8 Gen 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🖼️ نوع الشاشة</label>
            <input
              className="border p-2 rounded w-full"
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              placeholder="مثلاً: AMOLED 120Hz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🔋 حجم البطارية</label>
            <input
              className="border p-2 rounded w-full"
              value={battery}
              onChange={(e) => setBattery(e.target.value)}
              placeholder="مثلاً: 5000mAh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">💾 السعة/الذاكرة</label>
            <input
              className="border p-2 rounded w-full"
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="مثلاً: 12GB RAM / 256GB"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🗂️ القسم</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center justify-start gap-2 border p-2 rounded text-sm w-full text-right ${
                      category === cat.value ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🖼️ صورة المنتج</label>
            {image && (
              <img src={image} alt="صورة المنتج" className="w-32 h-32 object-cover mb-2" />
            )}
            <Button variant="outline" onClick={openUploadWidget}>
              <Upload className="w-4 h-4 mr-2" /> اختر صورة من Uploadcare
            </Button>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "...جاري الحفظ" : "✅ حفظ المنتج"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
