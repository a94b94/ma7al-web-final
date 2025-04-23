// encrypt.ts
import bcrypt from "bcryptjs";

async function encryptPassword() {
  const plainPassword = "admin1234"; // 👈 غيرها إذا تحب
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log("🔐 كلمة المرور المشفرة:", hash);
}

encryptPassword();
