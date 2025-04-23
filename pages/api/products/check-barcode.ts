import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: "الباركود مطلوب" });
  }

  try {
    await connectToDatabase();
    const product = await Product.findOne({ barcode });

    if (product) {
      return res.status(200).json({ exists: true, product });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("❌ Error checking barcode:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء الفحص" });
  }
}
