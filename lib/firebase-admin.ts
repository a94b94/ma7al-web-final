import admin from "firebase-admin";

// ✅ تأكد أن المفتاح موجود وإلا أطلق خطأ واضح
const raw = process.env.FIREBASE_ADMIN_KEY;

if (!raw) {
  throw new Error("❌ متغير البيئة FIREBASE_ADMIN_KEY غير موجود في .env.local");
}

if (!admin.apps.length) {
  let serviceAccount;

  try {
    serviceAccount = JSON.parse(raw);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
  } catch (err) {
    throw new Error("❌ فشل في تحليل FIREBASE_ADMIN_KEY: تأكد من أنه JSON صالح");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
