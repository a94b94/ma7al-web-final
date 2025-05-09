export default async function handler(req, res) {
  try {
    const response = await fetch("https://ma7al-whatsapp-production.up.railway.app/status");
    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({
        connected: data.connected || false,  // ✅ عدّلنا من isReady إلى connected
        qr: data.qr || null,
      });
    } else {
      return res.status(500).json({ connected: false, qr: null });
    }
  } catch (err) {
    return res.status(500).json({
      connected: false,
      qr: null,
      error: "فشل الاتصال بسيرفر الواتساب",
    });
  }
}
