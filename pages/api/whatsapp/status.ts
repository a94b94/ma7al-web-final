// pages/api/whatsapp/status.ts
import type { NextApiRequest, NextApiResponse } from "next";

type WhatsAppStatus = {
  connected: boolean;
  qr: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhatsAppStatus | { error: string; connected: false; qr: null }>
) {
  try {
    // ✅ اقرأ الرابط من ENV (الأفضل)
    const base =
      process.env.WHATSAPP_SERVER_URL ||
      process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL ||
      "";

    if (!base) {
      return res.status(500).json({
        connected: false,
        qr: null,
        error:
          "WHATSAPP_SERVER_URL غير موجود. ضيفه في Vercel Environment Variables",
      });
    }

    // ✅ تأكد ماكو / بالنهاية
    const normalizedBase = base.replace(/\/+$/, "");

    // ✅ نجيب status من سيرفر الواتساب (Fly)
    const response = await fetch(`${normalizedBase}/status`, {
      method: "GET",
      // يمنع كاش Vercel/CDN حتى تشوف QR والتغيرات فوراً
      headers: { "cache-control": "no-store" },
    });

    if (!response.ok) {
      return res.status(502).json({
        connected: false,
        qr: null,
        error: `فشل جلب status من سيرفر الواتساب: ${response.status}`,
      });
    }

    const data = (await response.json()) as Partial<WhatsAppStatus>;

    return res.status(200).json({
      connected: Boolean(data.connected),
      qr: typeof data.qr === "string" ? data.qr : null,
    });
  } catch (err) {
    return res.status(500).json({
      connected: false,
      qr: null,
      error: "فشل الاتصال بسيرفر الواتساب",
    });
  }
}
