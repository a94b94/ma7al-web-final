
const { Client } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");

const app = express();
app.use(cors());

let currentQr = null;
let isReady = false;

const client = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  currentQr = await qrcode.toDataURL(qr);
  isReady = false;
  console.log("🔄 QR Generated");
});

client.on("ready", () => {
  isReady = true;
  currentQr = null;
  console.log("✅ WhatsApp Client Ready");
});

client.initialize();

// API: GET /qr
app.get("/qr", (req, res) => {
  if (isReady) return res.json({ qr: null, isReady: true });
  if (currentQr) return res.json({ qr: currentQr, isReady: false });
  return res.status(404).json({ error: "❌ لا يوجد QR حالياً" });
});

// ✅ ابدأ السيرفر
app.listen(5000, () => {
  console.log("🚀 WhatsApp server running on http://localhost:5000");
});
