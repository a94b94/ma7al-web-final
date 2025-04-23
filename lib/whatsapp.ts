
import twilio from "twilio";

const accountSid = process.env.TWILIO_SID!; // 👍 تأكد موجود في .env.local
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

const FROM_WHATSAPP = "whatsapp:+14155238886"; // رقم Twilio المخصص لواتساب
const TO_WHATSAPP = "whatsapp:+9647700000000"; // ← استبدله برقمك الحقيقي

export async function sendWhatsAppMessage(message: string, phone?: string, address?: string) {
  try {
    const fullMessage = `${message}

📞 رقم الزبون: ${phone || "غير محدد"}
📍 العنوان: ${address || "غير محدد"}`;

    const res = await client.messages.create({
      from: FROM_WHATSAPP,
      to: TO_WHATSAPP,
      body: fullMessage,
    });
    console.log("✅ تم إرسال الرسالة على واتساب:", res.sid);
    return res.sid;
  } catch (error) {
    console.error("❌ فشل في إرسال رسالة واتساب:", error);
    throw error;
  }
}
