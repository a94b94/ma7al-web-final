"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export default function ImportInventoryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const extractTextFromPDF = async (file: File) => {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
    let text = "";

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  };

  const extractTextFromImage = async (file: File) => {
    const result = await Tesseract.recognize(file, "ara", {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  };

  const parseLinesToProducts = (rawText: string) => {
    const lines = rawText.split("\n").filter((line) => line.trim().length > 0);

    const result = lines.map((line, index) => {
      let cleanedLine = line.replace(/\s+/g, " ").trim();

      // 1️⃣ تنسيق مفصول بـ |
      if (cleanedLine.includes("|")) {
        const parts = cleanedLine.split("|").map((s) => s.trim());
        if (parts.length >= 4) {
          const [barcode, name, quantity, price] = parts;
          const q = parseInt(quantity);
          const p = parseFloat(price);
          if (!barcode || !name || isNaN(q) || isNaN(p)) return null;
          return {
            id: index + "-" + Date.now(),
            barcode,
            name,
            quantity: q,
            purchasePrice: p,
            isPublished: false,
          };
        }
      }

      // 2️⃣ تنسيق بدون فواصل
      const words = cleanedLine.split(" ");
      const numbers = words.filter((w) => /^\d+(\.\d+)?$/.test(w));
      const nonNumbers = words.filter((w) => !/^\d+(\.\d+)?$/.test(w));

      if (numbers.length >= 2) {
        const price = parseFloat(numbers.pop()!);
        const quantity = parseInt(numbers.pop()!);
        const barcode = numbers.shift() || Math.floor(Math.random() * 1000000).toString();
        const name = nonNumbers.join(" ") || "منتج غير مسمى";

        if (isNaN(quantity) || isNaN(price)) return null;

        return {
          id: index + "-" + Date.now(),
          barcode,
          name,
          quantity,
          purchasePrice: price,
          isPublished: false,
        };
      }

      return null;
    });

    return result.filter(Boolean);
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    try {
      let extracted = "";
      if (file.type === "application/pdf") {
        extracted = await extractTextFromPDF(file);
      } else {
        extracted = await extractTextFromImage(file);
      }

      setExtractedText(extracted);

      const parsed = parseLinesToProducts(extracted);
      if (parsed.length === 0) {
        toast.error("❌ لم يتم استخراج أي منتجات. تأكد من تنسيق الفاتورة.");
      } else {
        setProducts(parsed);
        toast.success(`✅ تم استخراج ${parsed.length} منتج.`);
      }
    } catch (err) {
      console.error("❌ Extraction error:", err);
      toast.error("حدث خطأ أثناء استخراج النص من الملف.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      await Promise.all(
        products.map((product) => axios.post("/api/inventory/add", product))
      );
      toast.success("✅ تم استيراد جميع المنتجات بنجاح!");
      setProducts([]);
      setFile(null);
    } catch (err) {
      console.error("❌ Import error:", err);
      toast.error("فشل في حفظ بعض المنتجات إلى المخزن.");
    }
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">📥 استيراد فاتورة شراء</h1>

      <input
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileChange}
        className="border p-2 rounded w-full sm:w-96"
      />

      <Button disabled={!file || loading} onClick={handleExtract}>
        🔍 استخراج المنتجات
      </Button>

      {extractedText && (
        <div>
          <h2 className="text-sm text-gray-600 mt-4">📜 النص الكامل المستخرج:</h2>
          <textarea className="w-full h-40 p-2 border rounded" readOnly value={extractedText} />
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold">📦 المنتجات المستخرجة:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">الباركود</th>
                  <th className="border p-2">الاسم</th>
                  <th className="border p-2">الكمية</th>
                  <th className="border p-2">سعر الشراء</th>
                  <th className="border p-2">حذف</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="border p-2">{p.barcode}</td>
                    <td className="border p-2">{p.name}</td>
                    <td className="border p-2">{p.quantity}</td>
                    <td className="border p-2">{p.purchasePrice}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="text-red-600 font-bold"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleImport}>✅ إضافة إلى المخزن</Button>
        </div>
      )}
    </div>
  );
}
