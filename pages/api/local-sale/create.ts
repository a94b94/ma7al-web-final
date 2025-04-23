import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await dbConnect();

    console.log("📦 البيانات المستلمة:", req.body); // ✅ طباعة البيانات

    const invoice = await LocalInvoice.create(req.body);

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error("❌ خطأ أثناء الحفظ:", error); // ✅ طباعة الخطأ الكامل
    res.status(500).json({ success: false, error: "فشل في حفظ الفاتورة" });
  }
}
