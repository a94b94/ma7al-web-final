// pages/api/user/save-cart.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { verify } from "jsonwebtoken";

interface CartItem {
  productId: string;
  quantity: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "🚫 الوصول مرفوض. لا يوجد توكن." });
  }

  const token = authHeader.split(" ")[1];

  try {
    await connectDB();

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { cart: incomingCart } = req.body;

    if (!Array.isArray(incomingCart)) {
      return res.status(400).json({ error: "❗ السلة غير صالحة. يجب أن تكون مصفوفة." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "⚠️ المستخدم غير موجود" });
    }

    const currentCart: CartItem[] = user.cart || [];

    // ✅ دمج السلة
    const mergedCart: CartItem[] = [...currentCart];

    for (const incomingItem of incomingCart) {
      if (!incomingItem?.productId || typeof incomingItem.quantity !== "number") continue;

      const index = mergedCart.findIndex(item => item.productId === incomingItem.productId);
      if (index !== -1) {
        mergedCart[index].quantity += incomingItem.quantity;
      } else {
        mergedCart.push({ productId: incomingItem.productId, quantity: incomingItem.quantity });
      }
    }

    user.cart = mergedCart;
    await user.save();

    return res.status(200).json({ message: "✅ تم حفظ السلة بنجاح", cart: mergedCart });
  } catch (err: any) {
    console.error("❌ خطأ أثناء حفظ السلة:", err.message || err);
    return res.status(500).json({ error: "⚠️ خطأ داخلي في الخادم" });
  }
}
