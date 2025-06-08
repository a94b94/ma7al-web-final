"use client";

import { useState } from "react";
import axios from "axios";

type UploadedImage = {
  url: string;
  public_id: string;
};

export default function MultiImageUploader({
  images,
  setImages,
}: {
  images: UploadedImage[];
  setImages: (val: UploadedImage[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    const uploaded: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await axios.post("/api/upload", {
            imageBase64: reader.result,
          });
          uploaded.push({ url: res.data.url, public_id: res.data.public_id });
          setImages([...images, ...uploaded]);
        } catch {
          alert("فشل رفع صورة");
        }
      };
      reader.readAsDataURL(file);
    }

    setLoading(false);
  };

  const handleRemove = (public_id: string) => {
    setImages(images.filter((img) => img.public_id !== public_id));
  };

  return (
    <div>
      <label className="block mb-1 font-medium">📸 صور المنتج</label>
      <input type="file" multiple accept="image/*" onChange={handleUpload} />
      {loading && <p className="text-sm text-gray-500">⏳ جاري رفع الصور...</p>}

      <div className="flex flex-wrap mt-3 gap-2">
        {images.map((img) => (
          <div key={img.public_id} className="relative w-24 h-24 border rounded overflow-hidden">
            <img src={img.url} alt="Product" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img.public_id)}
              className="absolute top-0 right-0 bg-red-500 text-white px-1 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
