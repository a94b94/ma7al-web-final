import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '❌ Method Not Allowed' });
  }

  try {
    await dbConnect();

    const {
      name,
      storeName,
      location,
      storeLogo,
      email,
      password,
      role,
    } = req.body;

    // ✅ التحقق من كل الحقول المطلوبة
    if (!name || !email || !password || !storeName || !location || !storeLogo || !role) {
      return res.status(400).json({ error: '⚠️ جميع الحقول مطلوبة' });
    }

    // ✅ التحقق من وجود البريد مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '📧 البريد الإلكتروني مستخدم مسبقًا' });
    }

    // ✅ التحقق من تكرار اسم المتجر
    const existingStore = await User.findOne({ storeName });
    if (existingStore) {
      return res.status(400).json({ error: '🏪 اسم المتجر مستخدم مسبقًا' });
    }

    // ✅ تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ إنشاء المستخدم
    const newUser = await User.create({
      name,
      storeName,
      location,
      storeLogo,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: '✅ تم إنشاء الحساب بنجاح',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        storeName: newUser.storeName,
        location: newUser.location,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('⛔ Error in signup:', error.message);
    return res.status(500).json({ error: '❌ خطأ في الخادم الداخلي' });
  }
}
