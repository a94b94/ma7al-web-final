// pages/api/shipments/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Shipment from "@/models/Shipment";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, error: "رقم الشحنة غير صالح" });
  }

  try {
    await dbConnect();

    // ✅ جلب بيانات الشحنة وتحديد النوع الصريح
    const shipment = await Shipment.findById(id).lean() as any;

    if (!shipment) {
      return res.status(404).json({ success: false, error: "الشحنة غير موجودة" });
    }

    // ✅ إذا ما بيها منتجات، نرجعها بدون مشاكل
    if (!shipment.products || !Array.isArray(shipment.products)) {
      return res.status(200).json({
        success: true,
        shipment: {
          ...shipment,
          _id: shipment._id.toString(),
          receivedAt: shipment.receivedAt?.toString() || null,
          products: [],
        },
      });
    }

    // ✅ جلب معلومات المنتجات من قاعدة البيانات
    const enrichedProducts = await Promise.all(
      shipment.products.map(async (p: any) => {
        const prod = await Product.findById(p.productId).lean();
        return {
          ...p,
          productInfo: prod
            ? {
                name: prod.name,
                price: prod.price,
                image: Array.isArray(prod.images) ? prod.images[0] : null,
                category: prod.category || null,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      shipment: {
        ...shipment,
        _id: shipment._id.toString(),
        receivedAt: shipment.receivedAt?.toString() || null,
        products: enrichedProducts,
      },
    });
  } catch (error) {
    console.error("❌ فشل في جلب الشحنة:", error);
    return res.status(500).json({ success: false, error: "فشل داخلي في الخادم" });
  }
}
