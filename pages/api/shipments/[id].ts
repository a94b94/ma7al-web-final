import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Shipment from "@/models/Shipment";
import Product from "@/models/Product";
import mongoose, { Document } from "mongoose";

// نُعرف شكل منتج الشحنة بدقة
interface ShipmentProduct {
  productId: string;
  quantity: number;
}

// نُعرف نوع الشحنة نفسها
interface ShipmentType extends Document {
  _id: mongoose.Types.ObjectId;
  products: ShipmentProduct[];
  receivedAt?: Date;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "❗ رقم الشحنة غير صالح" });
  }

  try {
    await dbConnect();

    const shipment = (await Shipment.findById(id).lean()) as ShipmentType | null;

    if (!shipment) {
      return res.status(404).json({ success: false, error: "❗ الشحنة غير موجودة" });
    }

    const rawProducts = shipment.products || [];

    if (rawProducts.length === 0) {
      return res.status(200).json({
        success: true,
        shipment: {
          ...shipment,
          _id: shipment._id.toString(),
          receivedAt: shipment.receivedAt?.toString() || null,
          products: [],
          totalQuantity: 0,
          totalValue: 0,
        },
      });
    }

    const productIds = rawProducts
      .map((p) =>
        mongoose.Types.ObjectId.isValid(p.productId)
          ? new mongoose.Types.ObjectId(p.productId)
          : null
      )
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();

    const productsMap = new Map<string, any>();
    dbProducts.forEach((prod) => {
      productsMap.set(prod._id.toString(), {
        name: prod.name,
        price: prod.price,
        image: Array.isArray(prod.images) ? prod.images[0] : null,
        category: prod.category || null,
      });
    });

    let totalQuantity = 0;
    let totalValue = 0;

    const enrichedProducts = rawProducts.map((p) => {
      const info = productsMap.get(p.productId?.toString()) || null;
      const quantity = p.quantity || 0;
      const price = info?.price || 0;

      totalQuantity += quantity;
      totalValue += quantity * price;

      return {
        ...p,
        productInfo: info,
      };
    });

    return res.status(200).json({
      success: true,
      shipment: {
        ...shipment,
        _id: shipment._id.toString(),
        receivedAt: shipment.receivedAt?.toString() || null,
        products: enrichedProducts,
        totalQuantity,
        totalValue,
      },
    });
  } catch (error: any) {
    console.error("❌ فشل في جلب الشحنة:", error?.message || error);
    return res.status(500).json({ success: false, error: "⚠️ فشل داخلي في الخادم" });
  }
}
