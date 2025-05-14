// pages/admin/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Tesseract from "tesseract.js";

const detectCategory = (name: string) => {
  const lowered = name.toLowerCase();
  if (lowered.includes("laptop") || lowered.includes("لابتوب")) return "لابتوبات";
  if (lowered.includes("mobile") || lowered.includes("موبايل")) return "موبايلات";
  if (lowered.includes("headphone") || lowered.includes("سماعة")) return "سماعات";
  if (lowered.includes("watch") || lowered.includes("ساعة")) return "ساعات";
  return "غير مصنّف";
};

export default function InventoryPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/inventory?published=false").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const publishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/publish`);
      toast.success("✅ تم نشر المنتج");
      setProducts((prev) => prev.filter((p: any) => p._id !== id));
    } catch (err) {
      toast.error("فشل في النشر");
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const existingBarcodes = new Set(products.map((p: any) => p.barcode));

      if (file.type === "application/pdf") {
        toast.loading("📄 جارٍ استخراج النص من PDF...");

        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }

        toast.dismiss();
        toast.success("✅ تم استخراج النص، جارٍ التحليل...");

        const lines = fullText.split("\n");
        const extracted: any[] = [];

        for (const line of lines) {
          const match = line.match(/(.*)\s+(\d+[.,]?\d*)\s+(\d+)/);
          if (match) {
            const name = match[1].trim();
            const purchasePrice = parseFloat(match[2].replace(",", ""));
            const quantity = parseInt(match[3]);
            const category = detectCategory(name);
            const barcode = name.toLowerCase().replace(/\s+/g, "-");

            if (!existingBarcodes.has(barcode)) {
              extracted.push({ name, purchasePrice, quantity, category, barcode });
              existingBarcodes.add(barcode);
            }
          }
        }

        if (extracted.length > 0) {
          const confirm = window.confirm(`تم استخراج ${extracted.length} منتج جديد من PDF. هل ترغب في نشرها للمخزن؟`);
          if (confirm) {
            const res = await axios.post("/api/purchase/ocr", { products: extracted });
            if (res.data.success) {
              toast.success("📦 تم رفع المنتجات من PDF بنجاح");
              setProducts((prev) => [...prev, ...res.data.inserted]);
            }
          }
        } else {
          toast.error("❌ لم يتم العثور على بيانات صالحة داخل PDF أو كانت مكررة");
        }
        return;
      }

      // OCR للصور
      toast.loading("🔍 جارٍ تحليل الصورة...");
      const { data: { text } } = await Tesseract.recognize(reader.result as string, "eng");
      toast.dismiss();
      toast.success("✅ تم استخراج البيانات، جارٍ تحليل النص...");

      const extracted: any[] = [];
      const lines = text.split("\n");
      for (const line of lines) {
        const match = line.match(/(.*)\s+(\d+[.,]?\d*)\s+(\d+)/);
        if (match) {
          const name = match[1].trim();
          const purchasePrice = parseFloat(match[2].replace(",", ""));
          const quantity = parseInt(match[3]);
          const category = detectCategory(name);
          const barcode = name.toLowerCase().replace(/\s+/g, "-");

          if (!existingBarcodes.has(barcode)) {
            extracted.push({ name, purchasePrice, quantity, category, barcode });
            existingBarcodes.add(barcode);
          }
        }
      }

      if (extracted.length > 0) {
        const confirm = window.confirm(`تم استخراج ${extracted.length} منتج جديد. هل ترغب في نشرها للمخزن؟`);
        if (confirm) {
          const res = await axios.post("/api/purchase/ocr", { products: extracted });
          if (res.data.success) {
            toast.success("📦 تم رفع المنتجات للمخزن بنجاح");
            setProducts((prev) => [...prev, ...res.data.inserted]);
          }
        }
      } else {
        toast.error("❌ لم يتم العثور على بيانات منتجات جديدة أو كانت مكررة");
      }
    };

    if (file.type === "application/pdf") {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📦 المنتجات في المخزن (غير منشورة)</h1>

      <div className="flex items-center justify-between mb-4">
        <Link
          href="/admin/purchase"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ إنشاء فاتورة شراء جديدة
        </Link>

        <label className="text-sm text-gray-600">
          أو ارفع صورة / PDF للفاتورة:
          <input
            type="file"
            accept=".pdf,image/*"
            className="block mt-1 text-sm border rounded p-1"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
          />
        </label>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">لا توجد منتجات غير منشورة حالياً.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">المنتج</th>
              <th className="p-2 border">القسم</th>
              <th className="p-2 border">سعر الشراء</th>
              <th className="p-2 border">الكمية</th>
              <th className="p-2 border">نشر</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product._id}>
                <td className="p-2 border">{product.name}</td>
                <td className="p-2 border">{product.category}</td>
                <td className="p-2 border">{product.purchasePrice.toLocaleString()} د.ع</td>
                <td className="p-2 border">{product.quantity}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => publishProduct(product._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    نشر
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
