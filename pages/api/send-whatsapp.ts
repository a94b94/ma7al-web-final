import type { NextApiRequest, NextApiResponse } from "next";
import { Client, LocalAuth } from "whatsapp-web.js";

let client: Client | null = null;
let isReady = false;

if (!client) {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: "ma7al-store" }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("ready", () => {
    isReady = true;
    console.log("✅ WhatsApp Client Ready");
  });

  client.on("disconnected", () => {
    isReady = false;
    console.log("🔌 WhatsApp Disconnected");
    client?.initialize();
  });

  client.initialize();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "رقم الهاتف أو الرسالة مفقودة" });
  }

  if (!isReady || !client) {
    return res.status(503).json({ error: "واتساب غير متصل حالياً" });
  }

  try {
    const formatted = phone.startsWith("+") ? phone : `+964${phone}`;
    // استخدم non-null assertion لأن تحققنا أن client ليس null
    await client!.sendMessage(`${formatted}@c.us`, message);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ فشل في الإرسال:", error);
    return res.status(500).json({ error: "فشل في إرسال الرسالة" });
  }
}
