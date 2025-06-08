// pages/api/purchase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import InventoryProduct, { InventoryProductType } from "@/models/InventoryProduct";
import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { supplierName, invoiceNumber, fileBase64 } = req.body;

  if (!supplierName || !invoiceNumber || !fileBase64) {
    return res.status(400).json({ error: "البيانات غير مكتملة" });
  }

  try {
    await connectDB();

    const isPdf = fileBase64.startsWith("data:application/pdf");
    let extractedText = "";

    if (isPdf) {
      const base64Data = fileBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else {
      const base64Data = fileBase64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const { data: { text } } = await Tesseract.recognize(buffer, "eng+ara");
      extractedText = text;
    }

    const productLines = extractedText.split("\n").filter(line => /[a-zA-Z\u0600-\u06FF]/.test(line));
    const products: Partial<InventoryProductType>[] = productLines.map((line) => {
      const parts = line.split(/\s{2,}|\t|\s-/);
      return {
        name: parts[0]?.trim() || "منتج غير معرف",
        purchasePrice: parseFloat(parts[1]) || 0,
        quantity: parseInt(parts[2]) || 1,
        category: "غير مصنف",
        isPublished: false,
        createdAt: new Date(),
      };
    });

    const insertedProducts = await InventoryProduct.insertMany(products);

    const invoice = new PurchaseInvoice({
      supplierName,
      invoiceNumber,
      date: new Date(),
      products: insertedProducts.map((p) => p._id),
      totalAmount: insertedProducts.reduce((sum, p) => sum + (p.purchasePrice || 0) * (p.quantity || 1), 0),
      createdAt: new Date(),
    });

    await invoice.save();

    res.status(200).json({ success: true, invoiceId: invoice._id });
  } catch (err) {
    console.error("❌ Error saving purchase:", err);
    res.status(500).json({ error: "فشل في حفظ الفاتورة" });
  }
}
