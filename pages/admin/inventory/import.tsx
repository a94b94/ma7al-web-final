// File: pages/admin/inventory/import.tsx
"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function ImportInventoryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const extractTextFromPDF = async (file: File) => {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
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
    const result = lines.map((line) => {
      const [barcode, name, quantity, price] = line.split("|").map((s) => s.trim());
      if (!barcode || !name || !quantity || !price) return null;
      return {
        barcode,
        name,
        quantity: parseInt(quantity),
        purchasePrice: parseFloat(price),
        isPublished: false,
      };
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
      setText(extracted);
      const parsed = parseLinesToProducts(extracted);
      setProducts(parsed);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      for (const product of products) {
        await axios.post("/api/inventory/add", product);
      }
      alert("✅ تم استيراد المنتجات بنجاح!");
    } catch (err) {
      console.error("Import error:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">📥 استيراد فاتورة شراء</h1>
      <input type="file" accept=".pdf,image/*" onChange={handleFileChange} />
      <Button disabled={!file || loading} onClick={handleExtract}>
        🔍 استخراج المنتجات
      </Button>

      {products.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">📦 المنتجات المستخرجة:</h2>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border p-1">الباركود</th>
                <th className="border p-1">الاسم</th>
                <th className="border p-1">الكمية</th>
                <th className="border p-1">سعر الشراء</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td className="border p-1">{p.barcode}</td>
                  <td className="border p-1">{p.name}</td>
                  <td className="border p-1">{p.quantity}</td>
                  <td className="border p-1">{p.purchasePrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={handleImport}>✅ إضافة إلى المخزن</Button>
        </div>
      )}
    </div>
  );
}
