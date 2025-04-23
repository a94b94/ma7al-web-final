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

    const { name, storeName, email, password, role } = req.body;

    if (!name || !email || !password || !storeName || !role) {
      return res.status(400).json({ error: '⚠️ جميع الحقول مطلوبة' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: '📧 البريد الإلكتروني مستخدم مسبقاً' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      storeName,
      email,
      password: hashed,
      role,
    });

    res.status(201).json({ message: '✅ تم إنشاء الحساب بنجاح', user: newUser });
  } catch (error: any) {
    console.error('⛔ Error in signup:', error.message);
    res.status(500).json({ error: '❌ خطأ في الخادم الداخلي' });
  }
}
