// ✅ ImportInventoryPage.tsx – نسخة متقدمة مع حفظ الفاتورة

"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const supportedLanguages = [
  { code: "eng", label: "English" },
  { code: "ara", label: "Arabic" },
  { code: "ara+eng", label: "Arabic + English" },
];

export default function ImportInventoryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [ocrLang, setOcrLang] = useState("ara+eng");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");

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

  const extractTextFromImage = async (file: File, enhanced = false) => {
    const result = await Tesseract.recognize(file, ocrLang, {
      logger: (m) => console.log(m),
      ...(enhanced && {
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-+ ",
      }),
    });
    return result.data.text;
  };

  const parseLinesToProducts = (rawText: string) => {
    const lines = rawText
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter((line) => line.length > 0);

    const result = lines.map((line, index) => {
      const numbers = [...line.matchAll(/\d+(\.\d+)?/g)].map((m) => m[0]);
      if (numbers.length < 2) return null;

      let price = 0;
      let quantity = 0;

      for (let i = 0; i < numbers.length - 1; i++) {
        const q = parseInt(numbers[i]);
        const p = parseFloat(numbers[i + 1]);
        if (!isNaN(q) && !isNaN(p) && p > 1000 && q <= 100) {
          quantity = q;
          price = p;
          break;
        }
      }

      if (!quantity || !price) {
        price = parseFloat(numbers.pop()!);
        quantity = parseInt(numbers.pop()!);
      }

      if (isNaN(quantity) || isNaN(price)) return null;

      const name = line.replace(/\d+(\.\d+)?/g, "").trim();
      if (!name || name.length < 3) return null;

      return {
        id: `${index}-${Date.now()}`,
        barcode: Math.floor(Math.random() * 1000000).toString(),
        name,
        quantity,
        purchasePrice: price,
        isPublished: false,
      };
    });

    return result.filter(Boolean);
  };

  const handleExtract = async (enhanced = false) => {
    if (!file) return;
    setLoading(true);
    try {
      let extracted = "";
      if (file.type === "application/pdf") {
        extracted = await extractTextFromPDF(file);
      } else {
        extracted = await extractTextFromImage(file, enhanced);
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
    if (!invoiceNumber || !supplierName) {
      toast.error("📝 يرجى إدخال رقم الفاتورة واسم المورد");
      return;
    }

    setImporting(true);
    try {
      const res = await axios.post("/api/inventory/import-invoice", {
        invoiceNumber,
        supplierName,
        products,
      });

      toast.success("✅ تم حفظ الفاتورة والمنتجات بنجاح!");
      setProducts([]);
      setFile(null);
      setInvoiceNumber("");
      setSupplierName("");
    } catch (err) {
      console.error("❌ Import error:", err);
      toast.error("فشل في حفظ بعض البيانات.");
    } finally {
      setImporting(false);
    }
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, field: string, value: string | number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="text"
          placeholder="رقم الفاتورة"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
        <input
          type="text"
          placeholder="اسم المورد"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        />
      </div>

      <div className="flex gap-4 items-center">
        <Button disabled={!file || loading} onClick={() => handleExtract(false)}>
          🔍 استخراج المنتجات
        </Button>
        <Button variant="outline" disabled={!file || loading} onClick={() => handleExtract(true)}>
          ⚙️ تحليل دقيق محسّن
        </Button>
        <select
          value={ocrLang}
          onChange={(e) => setOcrLang(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {extractedText && (
        <div>
          <h2 className="text-sm text-gray-600 mt-4">📜 النص الكامل المستخرج:</h2>
          <textarea className="w-full h-40 p-2 border rounded" readOnly value={extractedText} />
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold">📦 المنتجات المستخرجة:</h2>
          <div className="flex justify-between mb-2">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "⏳ جاري الحفظ..." : "✅ إضافة إلى المخزن مع الفاتورة"}
            </Button>
            <Button variant="destructive" onClick={() => setProducts([])}>
              🗑 تفريغ الكل
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">الباركود</th>
                  <th className="border p-2">الاسم</th>
                  <th className="border p-2">الكمية</th>
                  <th className="border p-2">سعر الشراء</th>
                  <th className="border p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    {editingId === p.id ? (
                      <>
                        <td className="border p-2">
                          <input
                            value={p.barcode}
                            onChange={(e) => updateProduct(p.id, "barcode", e.target.value)}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            value={p.name}
                            onChange={(e) => updateProduct(p.id, "name", e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={p.quantity}
                            onChange={(e) => updateProduct(p.id, "quantity", +e.target.value)}
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            value={p.purchasePrice}
                            onChange={(e) => updateProduct(p.id, "purchasePrice", +e.target.value)}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="border p-2 text-center">
                          <Button size="sm" onClick={() => setEditingId(null)}>
                            💾 حفظ
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border p-2">{p.barcode}</td>
                        <td className="border p-2">{p.name}</td>
                        <td className="border p-2">{p.quantity}</td>
                        <td className="border p-2">{p.purchasePrice}</td>
                        <td className="border p-2 text-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(p.id)}>
                            ✏️ تعديل
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeProduct(p.id)}>
                            ❌ حذف
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
