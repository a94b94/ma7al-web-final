// server.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");

const app = express();

// ✅ السماح للمتجر يتصل بالسيرفر (عدّل origin حسب نطاقك)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ma7al-web-final.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

let currentQr = null;
let isReady = false;

// ✅ إعداد عميل WhatsApp مع LocalAuth (تخزين الجلسة)
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "ma7al-whatsapp" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// 🔄 عند توليد QR
client.on("qr", async (qr) => {
  try {
    currentQr = await qrcode.toDataURL(qr);
    isReady = false;
    console.log("🔄 QR Generated - امسحه من واتساب (افتح /qr بالمتصفح)");
  } catch (err) {
    console.error("❌ خطأ في توليد صورة QR:", err);
  }
});

// ✅ عند الجاهزية
client.on("ready", () => {
  isReady = true;
  currentQr = null;
  console.log("✅ WhatsApp Client Ready - متصل");
});

// ⚠️ فشل التوثيق
client.on("auth_failure", (msg) => {
  console.error("❌ فشل التوثيق، سيتم إعادة المحاولة:", msg);
});

// ⚠️ فصل الإتصال
client.on("disconnected", (reason) => {
  console.warn("⚠️ تم فصل الاتصال:", reason);
  isReady = false;
  // ممكن ترجع تشغّله:
  // client.initialize();
});

client.initialize();

/* ===================== REST API ===================== */

// ✅ جلب حالة الاتصال أو QR (للاستخدام من لوحة التحكم)
app.get("/status", (req, res) => {
  res.json({ connected: isReady, qr: currentQr });
});

// ✅ صفحة تعرض QR كصورة (تفتحها بالمتصفح وتستخدمها)
app.get("/qr", (req, res) => {
  if (!currentQr) {
    return res.status(404).send(`
      <html dir="rtl" lang="ar">
        <body style="background:#111;color:#eee;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
          <div style="text-align:center">
            <h2>لا يوجد QR حالياً</h2>
            <p>إذا كان العميل متصل، لن يتم توليد QR.</p>
          </div>
        </body>
      </html>
    `);
  }

  res.send(`
    <html dir="rtl" lang="ar">
      <body style="background:#111;color:#eee;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="text-align:center">
          <h2>امسح هذا الكود من تطبيق واتساب 📱</h2>
          <img src="${currentQr}" style="margin-top:16px;border-radius:16px;border:4px solid #0f0;" />
        </div>
      </body>
    </html>
  `);
});

// ✅ إرسال رسالة واتساب
app.post("/send", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res
      .status(400)
      .json({ success: false, error: "رقم الهاتف والرسالة مطلوبان" });
  }

  if (!isReady) {
    return res
      .status(400)
      .json({ success: false, error: "❌ الواتساب غير متصل حالياً" });
  }

  try {
    const jid = phone.endsWith("@c.us") ? phone : `${phone}@c.us`;
    await client.sendMessage(jid, message);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ خطأ في الإرسال:", error);
    res.status(500).json({ success: false, error: "فشل في إرسال الرسالة" });
  }
});

// ✅ مسار بسيط للصحة (لـ Railway وغيرها)
app.get("/", (req, res) => {
  res.send("✅ WhatsApp server is running");
});

// ✅ تشغيل السيرفر (مهم جداً لـ Railway: استخدم process.env.PORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Server is running on port ${PORT}`);
});
