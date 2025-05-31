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

      {/* تم تحديث الحقول لتتناسب مع التصميم الجديد */}
    </>
  );
}
