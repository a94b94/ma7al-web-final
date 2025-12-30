// pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Order from "@/models/Order";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/middleware/auth";

function safeString(v: any) {
  return typeof v === "string" ? v : "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "الطريقة غير مدعومة" });
  }

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "معرف الطلب غير صالح" });
  }

  try {
    await connectDB();

    // ✅ 1) حاول تقرأ التوكن (اختياري)
    // إذا موجود => نستخدمه للعرض الإداري/التحقق
    // إذا غير موجود => نخليها Public للزبون (مرحلة 1)
    let user: any = null;
    try {
      user = verifyToken(req);
    } catch {
      user = null;
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "لم يتم العثور على الطلب" });
    }

    // ✅ 2) إذا المستخدم Admin (توكن موجود): تحقق صلاحية المتجر
    // ملاحظة: حسب آخر تعديل بالموديل storeId ref = User
    if (user) {
      const userStoreId = safeString(user?.storeId) || safeString(user?._id);

      if (userStoreId && order.storeId?.toString() !== userStoreId) {
        return res
          .status(403)
          .json({ success: false, message: "لا تملك صلاحية الوصول لهذا الطلب" });
      }

      // ✅ Admin response (كامل)
      return res.status(200).json({ success: true, order });
    }

    // ✅ 3) Public response (للزبون): رجّع فقط ما يلزم للفاتورة
    // (هذه البيانات كافية لصفحة /order/[id].tsx + Invoice component)
    const publicOrder = {
      _id: order._id,
      phone: order.phone,
      address: order.address, // إذا ما تريد تعرض عنوان الزبون، احذفه هنا
      cart: order.cart,
      total: order.total,
      discount: order.discount || 0,
      paid: order.paid || 0,
      remaining: typeof order.remaining === "number" ? order.remaining : undefined,
      createdAt: order.createdAt,
      type: order.type,
      storeId: order.storeId,
      storeName: order.storeName,
      status: order.status,
    };

    return res.status(200).json({ success: true, order: publicOrder });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
}
