
import type { NextApiRequest, NextApiResponse } from "next";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";

const globalAny = global as any;

if (!globalAny.whatsappClient) {
  globalAny.whatsappClient = new Client({
    authStrategy: new LocalAuth({ clientId: "ma7al-store" }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  const client = globalAny.whatsappClient;

  client.on("qr", async (qr) => {
    globalAny.currentQr = await qrcode.toDataURL(qr);
    globalAny.isReady = false;
    console.log("🔄 QR Generated");
  });

  client.on("ready", () => {
    globalAny.isReady = true;
    globalAny.currentQr = null;
    console.log("✅ WhatsApp Client Ready");
  });

  client.on("disconnected", () => {
    globalAny.isReady = false;
    globalAny.currentQr = null;
    console.log("🔌 WhatsApp Disconnected");
    client.initialize(); // إعادة الاتصال تلقائيًا
  });

  client.initialize();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    qr: globalAny.currentQr || null,
    isReady: globalAny.isReady || false,
  });
}