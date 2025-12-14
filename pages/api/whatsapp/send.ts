// pages/api/whatsapp/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import NotificationModel from "@/models/Notification";
import Order from "@/models/Order";

/* ===================== Helpers ===================== */

// تطبيع أرقام العراق إلى digits بدون + (سيرفرك يحولها jid)
function normalizeIraqPhone(input: any) {
  let p = String(input || "").trim();
  p = p.replace(/[^\d+]/g, "");

  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (p.startsWith("+")) p = p.slice(1);

  if (p.startsWith("964")) return p;
  if (p.startsWith("0")) return "964" + p.slice(1);
  if (p.startsWith("7")) return "964" + p;

  return p;
}

function getWhatsappBaseUrl() {
  // مثال: https://ma7al-whatsapp66.fly.dev
  const base = process.env.WHATSAPP_SERVER_URL?.trim();
  if (!base) throw new Error("WHATSAPP_SERVER_URL is not set");
  return base.replace(/\/+$/, "");
}

async function safeReadJsonOrText(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

/* ===================== Handler ===================== */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  const { phone, message, orderId, sentBy, notificationType = "تذكير" } = req.body || {};

  if (!phone || !message || !orderId || !sentBy) {
    return res.status(400).json({
      success: false,
      error: "❗ البيانات ناقصة: تأكد من وجود الهاتف، الرسالة، الطلب، والمرسل",
    });
  }

  await connectDB();

  const baseUrl = getWhatsappBaseUrl();
  const formattedPhone = normalizeIraqPhone(phone);

  let apiResult: any = null;
  let sent = false;
  let httpStatus = 502; // افتراضياً إذا السيرفر الخارجي ما رد

  try {
    const t = withTimeout(15_000);

    const response = await fetch(`${baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WHATSAPP_API_KEY ? { "x-api-key": process.env.WHATSAPP_API_KEY } : {}),
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: String(message),
      }),
      signal: t.controller.signal,
    });

    t.clear();

    httpStatus = response.status;
    apiResult = await safeReadJsonOrText(response);

    // نجاح الإرسال يعتمد على OK + success من سيرفر Fly
    sent = response.ok && apiResult?.success === true;
  } catch (error: any) {
    apiResult = { error: error?.name === "AbortError" ? "timeout" : error?.message || "fetch failed" };
    sent = false;
  }

  // ✅ سجّل الإشعار (حتى لو فشل)
  // إذا موديلك ما يدعم provider/meta راح يسقط على المحاولة الثانية
  try {
    await NotificationModel.create({
      orderId,
      customerPhone: String(phone),
      message: String(message),
      sentBy: String(sentBy),
      notificationType,
      sentAt: new Date(),
      success: sent,
      provider: "fly-whatsapp",
      meta: { httpStatus, apiResult },
    });
  } catch {
    try {
      await NotificationModel.create({
        orderId,
        customerPhone: String(phone),
        message: String(message),
        sentBy: String(sentBy),
        notificationType,
        sentAt: new Date(),
        success: sent,
      });
    } catch (err) {
      console.warn("⚠️ Failed to write Notification:", err);
    }
  }

  // ✅ إذا نجح الإرسال حدّث الطلب
  if (sent) {
    try {
      await Order.findByIdAndUpdate(orderId, { reminderSent: true, sentBy });
    } catch (e) {
      console.warn("⚠️ Failed to update Order reminderSent:", e);
    }
  }

  // ✅ رجّع status مناسب
  // - 200 إذا تم الإرسال
  // - 502 إذا فشل الإرسال (بس يبقى مسجّل بالإشعارات)
  return res.status(sent ? 200 : 502).json({
    success: true, // نجاح معالجة الراوت داخل Next.js
    sent,          // هل انرسلت واتساب فعلاً؟
    message: sent
      ? "✅ تم إرسال الرسالة وتسجيل الإشعار"
      : "⚠️ تم تسجيل الإشعار لكن فشل إرسال الرسالة",
    whatsapp: {
      url: `${baseUrl}/send`,
      httpStatus,
    },
    apiResult,
  });
}
