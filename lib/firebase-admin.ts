// lib/firebase-admin.ts
import admin from "firebase-admin";
import serviceAccount from "@/config/firebase-key.json"; // تأكد أن هذا الملف موجود فعليًا

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;
