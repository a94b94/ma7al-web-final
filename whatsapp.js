const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

let currentQr = null;
let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "ma7al-whatsapp" }), // ✅ تخزين الجلسة محليًا
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  currentQr = await qrcode.toDataURL(qr);
  isReady = false;
  console.log("🔄 QR Generated - امسحه من واتساب");
});

client.on("ready", () => {
  isReady = true;
  currentQr = null;
  console.log("✅ WhatsApp Client Ready - متصل");
});

client.on("auth_failure", () => {
  console.error("❌ فشل التوثيق، سيتم إعادة المحاولة");
});

client.on("disconnected", (reason) => {
  console.warn("⚠️ تم فصل الاتصال:", reason);
  isReady = false;
});

client.initialize();

// ✅ جلب حالة الاتصال أو QR
app.get("/status", (req, res) => {
  res.json({ connected: isReady, qr: currentQr });
});

// ✅ إرسال رسالة واتساب
app.post("/send", async (req, res) => {
  const { phone, message } = req.body;

  if (!isReady) return res.status(400).json({ success: false, error: "❌ الواتساب غير متصل حالياً" });

  try {
    await client.sendMessage(`${phone}@c.us`, message);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ خطأ في الإرسال:", error);
    res.status(500).json({ success: false, error: "فشل في إرسال الرسالة" });
  }
});

// ✅ تشغيل السيرفر
app.listen(5000, () => {
  console.log("🚀 WhatsApp Server is running on http://localhost:5000");
});
