import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();
  const now = new Date();

  try {
    const orders = await Order.find({
      type: "installment",
      installments: {
        $elemMatch: {
          paid: false,
          date: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
        },
      },
    });

    let remindersSent = 0;

    for (const order of orders) {
      if (!order.phone || !Array.isArray(order.installments)) continue;

      const customerPhone = order.phone.replace("+", "");
      const customerName = order.customerName || "الزبون";
      const storeName = order.storeName || "المتجر";
      const nextDue = order.installments.find(i => !i.paid)?.date;

      if (!nextDue) continue;

      const dueDateStr = new Date(nextDue).toLocaleDateString("ar-IQ");
      const amount = order.remaining?.toLocaleString() || "غير محدد";

      const message = `📢 تذكير بموعد قسط\n👤 ${customerName}\n📅 ${dueDateStr}\n💰 ${amount} د.ع\n🛍️ متجر: ${storeName}`;

      const alreadySent = await NotificationModel.findOne({
        orderId: order._id,
        customerPhone,
        message,
      });

      if (!alreadySent) {
        const result = await fetch("https://ma7al-whatsapp-production.up.railway.app/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: customerPhone, message }),
        });

        let json = {};
        try {
          json = await result.json();
        } catch (err) {
          console.warn("⚠️ فشل تحويل الرد إلى JSON", err.message);
        }

        if ((json as any).success || result.ok) {
          remindersSent++;

          await NotificationModel.create({
            orderId: order._id,
            customerPhone,
            message,
            sentAt: new Date(),
          });
        } else {
          console.error("❌ فشل الإرسال", json);
        }
      }
    }

    res.status(200).json({ success: true, count: remindersSent });
  } catch (err) {
    console.error("❌ Auto Reminder Error:", err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "حدث خطأ غير متوقع" });
  }
}
