// pages/api/orders/split.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order, { IOrder } from "@/models/Order";
import Notification from "@/models/Notification";
import type { HydratedDocument } from "mongoose";

interface CartItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  storeId: string;
  storeName?: string;
}

function normalizeIraqiPhone(input: string) {
  let v = String(input || "").trim();

  // remove spaces and common separators
  v = v.replace(/[\s\-().]/g, "");

  // 00964 -> +964
  if (v.startsWith("00964")) v = "+964" + v.slice(5);

  // 964 -> +964
  if (v.startsWith("964")) v = "+964" + v.slice(3);

  // +9640 -> +964 (remove extra 0)
  if (v.startsWith("+9640")) v = "+964" + v.slice(5);

  return v;
}

function isValidIraqiPhone(phone: string) {
  const v = normalizeIraqiPhone(phone);

  // 07xxxxxxxxx
  if (/^07\d{9}$/.test(v)) return true;

  // +9647xxxxxxxxx
  if (/^\+9647\d{9}$/.test(v)) return true;

  return false;
}

function safeNumber(n: any) {
  const x = typeof n === "string" ? Number(n) : n;
  return Number.isFinite(x) ? x : NaN;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { phone, address, cart, paymentMethod } = req.body as {
      phone?: string;
      address?: string;
      cart?: CartItem[];
      paymentMethod?: "cash" | "card" | "installment";
    };

    const normalizedPhone = normalizeIraqiPhone(phone || "");

    // ✅ Validation
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: "يرجى إدخال رقم الهاتف." });
    }

    if (!isValidIraqiPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: "رقم الهاتف غير صحيح. مثال: 07xxxxxxxxx أو +9647xxxxxxxxx",
      });
    }

    const cleanAddress = String(address || "").trim();
    if (!cleanAddress || cleanAddress.length < 6) {
      return res
        .status(400)
        .json({ success: false, error: "يرجى إدخال عنوان واضح (على الأقل 6 أحرف)." });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, error: "سلة الشراء فارغة." });
    }

    // ✅ DB
    await connectDB();

    // ✅ Group cart by storeId مع تنظيف العناصر
    const ordersByStore: Record<string, CartItem[]> = {};

    for (const rawItem of cart) {
      const storeId = String(rawItem?.storeId || "").trim();
      const name = String(rawItem?.name || "").trim();
      const quantity = safeNumber(rawItem?.quantity);
      const price = safeNumber(rawItem?.price);

      if (!storeId || !name) continue;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;
      if (!Number.isFinite(price) || price <= 0) continue;

      const item: CartItem = {
        productId: rawItem?.productId,
        name,
        quantity: Math.floor(quantity),
        price,
        storeId,
        storeName: rawItem?.storeName,
      };

      if (!ordersByStore[storeId]) ordersByStore[storeId] = [];
      ordersByStore[storeId].push(item);
    }

    const storeIds = Object.keys(ordersByStore);
    if (storeIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "لا توجد عناصر صالحة داخل السلة." });
    }

    // ✅ Create orders in parallel
    const createdOrders: HydratedDocument<IOrder>[] = await Promise.all(
      storeIds.map(async (storeId) => {
        const storeCart = ordersByStore[storeId];

        const total = storeCart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const storeName = storeCart[0]?.storeName || "متجر غير معروف";

        const type =
          paymentMethod === "cash" ? "cash" : paymentMethod === "installment" ? "installment" : "cash";

        const newOrder = await Order.create({
          phone: normalizedPhone,
          address: cleanAddress,
          cart: storeCart,
          total,
          storeId,
          storeName,
          type,
          createdAt: new Date(),
        });

        // Notification (لا نخليها تكسر الطلب لو صار خطأ)
        try {
          await Notification.create({
            userId: storeId, // إذا عندك userId الحقيقي للمشرف/المالك غيّره هنا
            type: "order",
            message: `📦 طلب جديد من ${normalizedPhone} بقيمة ${total.toLocaleString()} د.ع`,
            orderId: newOrder._id,
            seen: false,
            createdAt: new Date(),
          });
        } catch {
          // ignore notification failure
        }

        return newOrder;
      })
    );

    // ✅ اختيار primaryOrderId:
    // الأفضل اختيار الطلب الأكبر قيمة حتى يكون "الأساسي"
    const sortedByTotal = [...createdOrders].sort((a: any, b: any) => (b.total || 0) - (a.total || 0));
    const primaryOrderId = String(sortedByTotal[0]._id);

    const orderIds = createdOrders.map((o) => String(o._id));

    return res.status(201).json({
      success: true,
      message: `تم إنشاء ${createdOrders.length} طلب حسب المتجر.`,
      ordersCount: createdOrders.length,
      primaryOrderId,
      orderIds,
      // أبقيت orders لأنك قد تستخدمها لاحقًا في الواجهة/الواتساب
      orders: createdOrders,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "حدث خطأ في السيرفر أثناء إنشاء الطلب.",
      details: process.env.NODE_ENV === "development" ? String(err?.message || err) : undefined,
    });
  }
}
