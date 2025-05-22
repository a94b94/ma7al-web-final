"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroImagesPage() {
  const [heroImages, setHeroImages] = useState({ phone: "", appliance: "" });

  const handleUpload = (type: "phone" | "appliance") => {
    const widget = (window as any).uploadcare.Widget("[role=uploadcare-uploader]");
    widget.openDialog(null, { publicKey: "767dc761271f23d1f796" }).done((fileInfo: any) => {
      const updated = { ...heroImages, [type]: fileInfo.cdnUrl };
      setHeroImages(updated);

      fetch("/api/settings/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    });
  };

  useEffect(() => {
    fetch("/api/settings/hero-images")
      .then((res) => res.json())
      .then((data) => setHeroImages(data));
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">🖼️ إعداد صور الواجهة</h1>

      <div className="space-y-4">
        <button onClick={() => handleUpload("phone")} className="bg-blue-600 text-white py-2 px-4 rounded">
          📱 رفع صورة الهاتف
        </button>
        {heroImages.phone && (
          <Image src={heroImages.phone} alt="هاتف" width={150} height={150} className="rounded shadow" />
        )}

        <button onClick={() => handleUpload("appliance")} className="bg-green-600 text-white py-2 px-4 rounded">
          ⚡ رفع صورة الجهاز الكهربائي
        </button>
        {heroImages.appliance && (
          <Image src={heroImages.appliance} alt="جهاز" width={150} height={150} className="rounded shadow" />
        )}
      </div>

      {/* عنصر مخفي لفتح نافذة Uploadcare */}
      <input type="hidden" role="uploadcare-uploader" />
    </div>
  );
}
