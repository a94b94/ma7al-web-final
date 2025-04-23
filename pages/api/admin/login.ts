import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبة' });
  }

  await connectToDatabase();

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: '❌ بيانات الدخول غير صحيحة' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: '❌ كلمة المرور غير صحيحة' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  return res.status(200).json({
    message: '✅ تسجيل الدخول تم بنجاح',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image || "/images/user.png", // ✅ الآن الصورة متوفرة
      storeName: user.storeName,
      storeLogo: user.storeLogo || "",
      storeStamp: user.storeStamp || "",
    },
  });
}
