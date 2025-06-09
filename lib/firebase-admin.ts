// lib/firebase-admin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const raw = process.env.FIREBASE_ADMIN_KEY || "{}";
  const serviceAccount = JSON.parse(raw);

  // ✅ إصلاح private_key لإزالة \\n وتحويلها إلى سطر جديد فعلي
  serviceAccount.private_key = serviceAccount.private_key?.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
