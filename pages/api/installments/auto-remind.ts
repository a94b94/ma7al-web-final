import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import NotificationModel from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();
  const now = new Date();

  try {
    // احصل على الطلبات التي تحتوي على أقساط غير مدفوعة وقريبة من اليوم (اليوم أو غدًا)
    const orders = await Order.find({
      type: "installment",
      installments: {
        $elemMatch: {
          paid: false,
          date: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) }, // اليوم أو غدًا
        },
      },
    });

    let remindersSent = 0;

    for (const order of orders) {
      const customerPhone = order.phone.replace("+", "");
      const customerName = order.customerName || "الزبون";
      const storeName = order.storeName;
      const nextDue = order.installments.find(i => !i.paid)?.date;
      const dueDateStr = new Date(nextDue).toLocaleDateString("ar-IQ");

      const message = `📢 تذكير بموعد قسط\n👤 ${customerName}\n📅 ${dueDateStr}\n💰 ${order.remaining?.toLocaleString()} د.ع\n🛍️ متجر: ${storeName}`;

      // تحقق إن تم إرسال هذا التذكير من قبل
      const alreadySent = await NotificationModel.findOne({
        orderId: order._id,
        customerPhone,
        message,
      });

      if (!alreadySent) {
        // أرسل الرسالة
        const result = await fetch("https://ma7al-whatsapp-production.up.railway.app/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: customerPhone, message }),
        });

        const json = await result.json();
        if (json.success || result.ok) {
          remindersSent++;

          // سجل التذكير
          await NotificationModel.create({
            orderId: order._id,
            customerPhone,
            message,
            sentAt: new Date(),
          });
        }
      }
    }

    res.status(200).json({ success: true, count: remindersSent });
  } catch (err) {
    console.error("❌ Auto Reminder Error:", err);
    res.status(500).json({ success: false, error: "حدث خطأ أثناء إرسال التذكيرات" });
  }
}
