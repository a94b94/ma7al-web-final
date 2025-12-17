// pages/api/whatsapp/status.ts
import type { NextApiRequest, NextApiResponse } from "next";

type WhatsAppStatus = {
  connected: boolean;
  qr: string | null;
};

type ErrorRes = {
  connected: false;
  qr: null;
  error: string;
  upstream?: string;
  status?: number;
  body?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhatsAppStatus | ErrorRes>
) {
  // ✅ اقرأ الرابط من ENV
  const base =
    process.env.WHATSAPP_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL ||
    "";

  if (!base) {
    return res.status(500).json({
      connected: false,
      qr: null,
      error: "WHATSAPP_SERVER_URL غير موجود. ضيفه في Vercel Environment Variables",
    });
  }

  const upstream = `${base.replace(/\/+$/, "")}/status`;

  try {
    // ✅ Timeout حتى ما يعلق
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: "application/json",
        "cache-control": "no-store",
      },
      signal: controller.signal,
    });

    clearTimeout(t);

    // ✅ نقرأ كنص أولاً حتى لو مو JSON
    const text = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        connected: false,
        qr: null,
        error: `فشل جلب status من سيرفر الواتساب`,
        upstream,
        status: response.status,
        body: text.slice(0, 400),
      });
    }

    // ✅ حاول تحويل JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        connected: false,
        qr: null,
        error: "سيرفر الواتساب رجّع رد غير JSON",
        upstream,
        status: response.status,
        body: text.slice(0, 400),
      });
    }

    return res.status(200).json({
      connected: Boolean(data?.connected),
      qr: typeof data?.qr === "string" ? data.qr : null,
    });
  } catch (err: any) {
    const msg =
      err?.name === "AbortError"
        ? "انتهت مهلة الاتصال بسيرفر الواتساب (Timeout)"
        : err?.message || "فشل الاتصال بسيرفر الواتساب";

    return res.status(502).json({
      connected: false,
      qr: null,
      error: msg,
      upstream,
    });
  }
}
