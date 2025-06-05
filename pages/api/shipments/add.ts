import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Shipment from "@/models/Shipment";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { supplier, note, products, reference = "", storeId = null } = req.body;

    // ✅ تحقق من المنتجات
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: "❗️قائمة المنتجات فارغة أو غير صالحة" });
    }

    // ✅ تحديد نوع المنتجات داخل الشحنة
    const shipmentProducts: { productId: string; quantity: number }[] = [];

    for (const item of products) {
      const { sku, name, quantity, purchasePrice } = item;

      // ✅ تحقق من صلاحية البيانات
      if (!sku || !name || typeof quantity !== "number" || quantity <= 0 || !purchasePrice) {
        return res.status(400).json({ success: false, error: "❗️بيانات منتج غير مكتملة أو خاطئة" });
      }

      // ✅ تحقق من وجود المنتج مسبقًا
      let product = await Product.findOne({ sku });

      if (product) {
        product.stock = (product.stock || 0) + quantity;
        await product.save();
      } else {
        product = await Product.create({
          sku,
          name,
          price: purchasePrice,
          category: "غير مصنّف",
          images: [],
          isFeatured: false,
          stock: quantity,
          storeId,
          published: false,
        });
      }

      shipmentProducts.push({
        productId: String(product._id),
        quantity,
      });
    }

    // ✅ إنشاء سجل الشحنة
    const shipment = await Shipment.create({
      supplier,
      note,
      reference,
      products: shipmentProducts,
      storeId,
    });

    return res.status(201).json({
      success: true,
      message: "✅ تم حفظ الشحنة وتحديث المخزون",
      shipment,
    });
  } catch (error: any) {
    console.error("❌ خطأ أثناء إضافة الشحنة:", error.message);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ داخلي أثناء إضافة الشحنة",
    });
  }
}
