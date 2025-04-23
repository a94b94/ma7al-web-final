import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "رقم الهاتف أو الرسالة ناقصة" });
  }

  try {
    const apiRes = await fetch("http://localhost:5000/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });

    const result = await apiRes.json();
    if (!result.status) throw new Error("فشل في الإرسال");

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "فشل في إرسال الرسالة" });
  }
}
