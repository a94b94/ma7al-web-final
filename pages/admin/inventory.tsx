// pages/admin/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Product = {
  _id: string;
  name: string;
  category: string;
  purchasePrice: number;
  quantity: number;
  barcode?: string;
};

const detectCategory = (name: string) => {
  const lowered = name.toLowerCase();
  if (/(laptop|لابتوب|notebook)/i.test(lowered)) return "لابتوبات";
  if (/(mobile|موبايل|phone|smartphone)/i.test(lowered)) return "موبايلات";
  if (/(headphone|سماعة|earbuds)/i.test(lowered)) return "سماعات";
  if (/(watch|ساعة|smartwatch)/i.test(lowered)) return "ساعات";
  if (/(tv|شاشة|monitor|شاشات)/i.test(lowered)) return "شاشات";
  return "غير مصنّف";
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get("/api/inventory?published=false").then((res) => {
      setProducts(res.data);
    });
  }, []);

  const publishProduct = async (id: string) => {
    try {
      await axios.put(`/api/inventory/${id}/publish`);
      toast.success("✅ تم نشر المنتج");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("فشل في النشر");
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const existingBarcodes = new Set(products.map((p) => p.barcode));
      const extracted: Product[] = [];

      const processLine = (line: string) => {
        const match = line.match(/(XIAOMI|POCO|IPHONE|TECNO|INFINIX|REDMI|.*?\d+.*?)(?:\s+)(\d{1,3}(?:,\d{3})+)(?:\s+)(\d+)/i);
        if (match) {
          const name = match[1].trim();
          const purchasePrice = parseFloat(match[2].replace(/,/g, ""));
          const quantity = parseInt(match[3]);
          const category = detectCategory(name);

          const barcodeMatch = line.match(/(?:باركود|barcode)[:\s]*(\d{6,})/i);
          const barcode = barcodeMatch ? barcodeMatch[1] : name.toLowerCase().replace(/\s+/g, "-");

          if (!existingBarcodes.has(barcode)) {
            extracted.push({ name, purchasePrice, quantity, category, barcode, _id: "" });
            existingBarcodes.add(barcode);
          }
        }
      };

      if (file.type === "application/pdf") {
        toast.loading("📄 جارٍ استخراج النص من PDF...");
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
        fullText.split("\n").forEach(processLine);
      } else {
        toast.loading("🔍 جارٍ تحليل الصورة...");
        const { data: { text } } = await Tesseract.recognize(reader.result as string, "eng");
        toast.dismiss();
        toast.success("✅ تم استخراج البيانات، جارٍ التحليل...");
        text.split("\n").forEach(processLine);
      }

      if (extracted.length > 0) {
        const confirm = window.confirm(`تم استخراج ${extracted.length} منتج جديد. هل ترغب في نشرها للمخزن؟`);
        if (confirm) {
          const res = await axios.post("/api/purchase/ocr", { products: extracted });
          if (res.data.success) {
            toast.success("📦 تم رفع المنتجات بنجاح");
            setProducts((prev) => [...prev, ...res.data.inserted]);
          }
        }
      } else {
        toast.error("❌ لم يتم العثور على منتجات جديدة أو كانت مكررة");
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
        <Link href="/admin/purchase" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
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
              if (file) handleFileUpload(file);
            }}
          />
        </label>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        عدد المنتجات غير المنشورة: <strong>{products.length}</strong>
      </p>

      {products.length > 0 && (
        <button
          onClick={async () => {
            const confirm = window.confirm("هل تريد نشر جميع المنتجات دفعة واحدة؟");
            if (!confirm) return;

            for (const product of products) {
              try {
                await axios.put(`/api/inventory/${product._id}/publish`);
              } catch {
                toast.error(`فشل نشر المنتج: ${product.name}`);
              }
            }

            toast.success("✅ تم نشر جميع المنتجات");
            setProducts([]);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm mb-4"
        >
          🚀 نشر الكل
        </button>
      )}

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
            {products.map((product) => (
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
